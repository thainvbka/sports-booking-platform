import {
    BookingStatus,
    MatchSkillLevel,
    MatchStatus,
    ParticipantStatus,
    Prisma,
} from "@prisma/client";
import {
    CACHE_KEYS,
    buildMatchDetailCacheKey,
    buildPublicMatchesCacheKey,
    CACHE_TTL,
    cacheHelper
} from "../../helpers/cache";
import { prisma } from "../../libs/prisma";
import {
    BadRequestError,
    ConflictRequestError,
    ForbiddenError,
    NotFoundError,
} from "../../utils/error.response";
import {
    CreateMatchInput,
    MatchParticipantsQuery,
    MyMatchesQuery,
    PublicMatchesQuery,
} from "../../validations";
import { sendNotificationIfNotExists } from "./notification.service";

const DEFAULT_JOIN_DEADLINE_MINUTES = 30;
const SERIALIZABLE_MAX_ATTEMPTS = 3;
const SERIALIZATION_FAILURE_CODE = "P2034";

const isSerializableRetryableError = (error: unknown) => {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === SERIALIZATION_FAILURE_CODE
  );
};

const runSerializableWithRetry = async <T>(
  operation: () => Promise<T>,
): Promise<T> => {
  for (let attempt = 1; attempt <= SERIALIZABLE_MAX_ATTEMPTS; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      if (
        !isSerializableRetryableError(error) ||
        attempt === SERIALIZABLE_MAX_ATTEMPTS
      ) {
        throw error;
      }
    }
  }

  throw new ConflictRequestError("SERIALIZATION_RETRY_FAILED: Please retry");
};

const invalidateMatchCaches = async (matchId?: string) => {
  if (matchId) {
    await cacheHelper.del(buildMatchDetailCacheKey(matchId));
    await cacheHelper.delByPattern(`match:${matchId}:participants:*`);
  }
  await cacheHelper.delByPattern(CACHE_KEYS.PATTERNS.MATCHES_LIST);
};

const matchListSelect = {
  id: true,
  status: true,
  sport_type: true,
  skill_level: true,
  title: true,
  description: true,
  slots_needed: true,
  slots_filled: true,
  join_deadline: true,
  created_at: true,
  booking: {
    select: {
      id: true,
      start_time: true,
      end_time: true,
      sub_field: {
        select: {
          id: true,
          sub_field_name: true,
          complex: {
            select: {
              id: true,
              complex_name: true,
              complex_address: true,
            },
          },
        },
      },
    },
  },
  creator: {
    select: {
      id: true,
      account: {
        select: {
          full_name: true,
          avatar: true,
        },
      },
    },
  },
} satisfies Prisma.MatchSelect;

const matchDetailSelect = {
  ...matchListSelect,
  updated_at: true,
} satisfies Prisma.MatchSelect;

const participantResponseSelect = {
  id: true,
  match_id: true,
  player_id: true,
  status: true,
  introduction: true,
  created_at: true,
  responded_at: true,
  left_at: true,
  player: {
    select: {
      id: true,
      account: {
        select: {
          full_name: true,
          avatar: true,
          phone_number: true,
        },
      },
    },
  },
} satisfies Prisma.MatchParticipantSelect;

type MatchListRecord = Prisma.MatchGetPayload<{
  select: typeof matchListSelect;
}>;

type MatchDetailRecord = Prisma.MatchGetPayload<{
  select: typeof matchDetailSelect;
}>;

type ParticipantResponseRecord = Prisma.MatchParticipantGetPayload<{
  select: typeof participantResponseSelect;
}>;

const mapMatchListItem = (match: MatchListRecord) => {
  const slotsLeft = Math.max(match.slots_needed - match.slots_filled, 0);

  return {
    id: match.id,
    status: match.status,
    sport_type: match.sport_type,
    skill_level: match.skill_level,
    title: match.title,
    description: match.description,
    slots_needed: match.slots_needed,
    slots_filled: match.slots_filled,
    slots_left: slotsLeft,
    join_deadline: match.join_deadline,
    created_at: match.created_at,
    booking: {
      id: match.booking.id,
      start_time: match.booking.start_time,
      end_time: match.booking.end_time,
      sub_field_id: match.booking.sub_field.id,
      sub_field_name: match.booking.sub_field.sub_field_name,
      complex_id: match.booking.sub_field.complex.id,
      complex_name: match.booking.sub_field.complex.complex_name,
      complex_address: match.booking.sub_field.complex.complex_address,
    },
    creator: {
      player_id: match.creator.id,
      full_name: match.creator.account.full_name,
      avatar: match.creator.account.avatar,
    },
  };
};

const mapMatchDetailItem = (
  match: MatchDetailRecord,
  acceptedCount: number,
  pendingCount: number,
) => {
  const slotsLeft = Math.max(match.slots_needed - match.slots_filled, 0);

  return {
    ...mapMatchListItem(match),
    updated_at: match.updated_at,
    accepted_count: acceptedCount,
    pending_count: pendingCount,
    participant_summary: {
      accepted_count: acceptedCount,
      pending_count: pendingCount,
      slots_left: slotsLeft,
    },
  };
};

const mapParticipantItem = (participant: ParticipantResponseRecord) => {
  return {
    id: participant.id,
    match_id: participant.match_id,
    player_id: participant.player_id,
    status: participant.status,
    introduction: participant.introduction,
    requested_at: participant.created_at,
    created_at: participant.created_at,
    responded_at: participant.responded_at,
    left_at: participant.left_at,
    player: {
      id: participant.player.id,
      full_name: participant.player.account.full_name,
      avatar: participant.player.account.avatar,
      phone: participant.player.account.phone_number,
      skill_level: null,
    },
  };
};

const getMappedMatchById = async (matchId: string) => {
  const match = await prisma.match.findUnique({
    where: { id: matchId },
    select: matchListSelect,
  });

  if (!match) {
    throw new NotFoundError("Match not found");
  }

  return mapMatchListItem(match);
};

const getMappedParticipantById = async (participantId: string) => {
  const participant = await prisma.matchParticipant.findUnique({
    where: { id: participantId },
    select: participantResponseSelect,
  });

  if (!participant) {
    throw new NotFoundError("Participant request not found");
  }

  return mapParticipantItem(participant);
};

const parseMatchSort = (
  sort?: PublicMatchesQuery["sort"],
): Prisma.MatchOrderByWithRelationInput => {
  if (sort === "start_time:asc") {
    return {
      booking: {
        start_time: "asc",
      },
    };
  }

  if (sort === "start_time:desc") {
    return {
      booking: {
        start_time: "desc",
      },
    };
  }

  return {
    created_at: "desc",
  };
};

const buildPublicMatchWhere = (
  query: PublicMatchesQuery,
): Prisma.MatchWhereInput => {
  const where: Prisma.MatchWhereInput = {};

  if (query.status) {
    where.status = query.status as MatchStatus;
  } else {
    where.status = MatchStatus.OPEN;
  }

  if (query.sport_type) {
    where.sport_type = query.sport_type;
  }

  if (query.skill_level) {
    where.skill_level = query.skill_level as MatchSkillLevel;
  }

  if (query.q) {
    where.OR = [
      {
        title: {
          contains: query.q,
          mode: "insensitive",
        },
      },
      {
        description: {
          contains: query.q,
          mode: "insensitive",
        },
      },
      {
        booking: {
          is: {
            sub_field: {
              complex: {
                complex_name: {
                  contains: query.q,
                  mode: "insensitive",
                },
              },
            },
          },
        },
      },
    ];
  }

  const bookingAnd: Prisma.BookingWhereInput[] = [];

  if (query.from_time || query.to_time) {
    bookingAnd.push({
      start_time: {
        ...(query.from_time ? { gte: query.from_time } : {}),
        ...(query.to_time ? { lte: query.to_time } : {}),
      },
    });
  }

  if (query.sub_field_id) {
    bookingAnd.push({
      sub_field_id: query.sub_field_id,
    });
  }

  if (query.complex_id) {
    bookingAnd.push({
      sub_field: {
        complex_id: query.complex_id,
      },
    });
  }

  if (query.province) {
    bookingAnd.push({
      sub_field: {
        complex: {
          complex_address: {
            contains: query.province,
            mode: "insensitive",
          },
        },
      },
    });
  }

  if (query.district) {
    bookingAnd.push({
      sub_field: {
        complex: {
          complex_address: {
            contains: query.district,
            mode: "insensitive",
          },
        },
      },
    });
  }

  if (bookingAnd.length > 0) {
    where.booking = {
      is: {
        AND: bookingAnd,
      },
    };
  }

  return where;
};

export const getPublicMatches = async (query: PublicMatchesQuery) => {
  const page = query.page ?? 1;
  const limit = query.limit ?? 20;
  const skip = (page - 1) * limit;

  // Only cache stable filters. Exclude search, time filters to prevent bloat & ensure fresh data
  const isCacheable = !query.q && !query.from_time && !query.to_time;
  const cacheKey = buildPublicMatchesCacheKey({
    page,
    limit,
    sport_type: query.sport_type,
    skill_level: query.skill_level,
    status: query.status,
    sort: query.sort,
  });

  if (isCacheable) {
    const cached = await cacheHelper.get(cacheKey);
    if (cached) {
      console.log(`[Cache HIT] Matches list: ${cacheKey}`);
      return cached;
    }
    console.log(`[Cache MISS] Matches list: ${cacheKey}`);
  } else {
    console.log(`[Cache SKIP] Search or time filters present - bypassing matches list cache`);
  }

  const where = buildPublicMatchWhere(query);
  const orderBy = parseMatchSort(query.sort);

  const [total, matches] = await prisma.$transaction([
    prisma.match.count({ where }),
    prisma.match.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      select: matchListSelect,
    }),
  ]);

  const result = {
    items: matches.map(mapMatchListItem),
    pagination: {
      page,
      limit,
      total_items: total,
      total_pages: Math.ceil(total / limit),
      has_next: page * limit < total,
    },
  };

  if (isCacheable) {
    await cacheHelper.set(cacheKey, result, CACHE_TTL.MATCHES);
  }

  return result;
};

export const getPublicMatchById = async (matchId: string) => {
  const cacheKey = buildMatchDetailCacheKey(matchId);

  // Try cache first
  const cached = await cacheHelper.get(cacheKey);
  if (cached) {
    console.log(`[Cache HIT] Match detail: ${matchId}`);
    return cached;
  }
  console.log(`[Cache MISS] Match detail: ${matchId}`);

  const match = await prisma.match.findUnique({
    where: { id: matchId },
    select: matchDetailSelect,
  });

  if (!match) {
    throw new NotFoundError("Match not found");
  }

  const [accepted_count, pending_count] = await prisma.$transaction([
    prisma.matchParticipant.count({
      where: {
        match_id: match.id,
        status: ParticipantStatus.ACCEPTED,
      },
    }),
    prisma.matchParticipant.count({
      where: {
        match_id: match.id,
        status: ParticipantStatus.PENDING,
      },
    }),
  ]);

  const result = mapMatchDetailItem(match, accepted_count, pending_count);

  // Cache the result (5min - status changes frequently)
  await cacheHelper.set(cacheKey, result, CACHE_TTL.MATCHES);

  return result;
};

export const getMatchByIdForPlayer = async (
  playerId: string,
  matchId: string,
) => {
  const match = await getPublicMatchById(matchId);

  const myParticipation = await prisma.matchParticipant.findUnique({
    where: {
      match_id_player_id: {
        match_id: matchId,
        player_id: playerId,
      },
    },
    select: {
      status: true,
    },
  });

  return {
    ...match,
    my_participation_status: myParticipation?.status ?? null,
  };
};

export const createMatch = async (playerId: string, data: CreateMatchInput) => {
  const now = new Date();

  const createdMatchId = await prisma.$transaction(async (tx) => {
    const booking = await tx.booking.findFirst({
      where: {
        id: data.booking_id,
        player_id: playerId,
        status: {
          in: [BookingStatus.CONFIRMED, BookingStatus.COMPLETED],
        },
        start_time: {
          gt: now,
        },
      },
      select: {
        id: true,
        start_time: true,
        sub_field: {
          select: {
            sport_type: true,
          },
        },
      },
    });

    if (!booking) {
      throw new BadRequestError(
        "Booking not found, not yours, not paid/confirmed, or already started",
      );
    }

    const existingMatch = await tx.match.findUnique({
      where: {
        booking_id: data.booking_id,
      },
      select: {
        id: true,
      },
    });

    if (existingMatch) {
      throw new ConflictRequestError("A match already exists for this booking");
    }

    const fallbackDeadline = new Date(
      booking.start_time.getTime() - DEFAULT_JOIN_DEADLINE_MINUTES * 60 * 1000,
    );
    const joinDeadline = data.join_deadline ?? fallbackDeadline;

    if (joinDeadline <= now) {
      throw new BadRequestError("join_deadline must be in the future");
    }

    if (joinDeadline >= booking.start_time) {
      throw new BadRequestError(
        "join_deadline must be earlier than booking start_time",
      );
    }

    const createdMatch = await tx.match.create({
      data: {
        booking_id: data.booking_id,
        creator_id: playerId,
        sport_type: booking.sub_field.sport_type,
        skill_level: (data.skill_level ?? "INTERMEDIATE") as MatchSkillLevel,
        title: data.title,
        description: data.description,
        slots_needed: data.slots_needed,
        slots_filled: 0,
        join_deadline: joinDeadline,
        status: MatchStatus.OPEN,
      },
      select: {
        id: true,
      },
    });

    return createdMatch.id;
  });
  const result = await getMappedMatchById(createdMatchId);
  await invalidateMatchCaches(createdMatchId);
  return result;
};

export const joinMatch = async (
  playerId: string,
  matchId: string,
  introduction?: string,
) => {
  const now = new Date();

  const participantId = await runSerializableWithRetry(() =>
    prisma.$transaction(
      async (tx) => {
        const match = await tx.match.findUnique({
          where: {
            id: matchId,
          },
          select: {
            id: true,
            creator_id: true,
            status: true,
            join_deadline: true,
            booking: {
              select: {
                start_time: true,
              },
            },
          },
        });

        if (!match) {
          throw new NotFoundError("Match not found");
        }

        if (match.creator_id === playerId) {
          throw new ForbiddenError("You cannot join your own match");
        }

        if (match.status !== MatchStatus.OPEN) {
          throw new ConflictRequestError("MATCH_NOT_OPEN: Match is not open");
        }

        if (match.join_deadline && match.join_deadline <= now) {
          throw new BadRequestError(
            "MATCH_JOIN_DEADLINE_PASSED: Join deadline passed",
          );
        }

        if (match.booking.start_time <= now) {
          throw new BadRequestError(
            "MATCH_STARTED: Cannot join a started match",
          );
        }

        const existing = await tx.matchParticipant.findUnique({
          where: {
            match_id_player_id: {
              match_id: matchId,
              player_id: playerId,
            },
          },
        });

        if (existing) {
          if (
            existing.status === ParticipantStatus.PENDING ||
            existing.status === ParticipantStatus.ACCEPTED
          ) {
            return existing.id;
          }

          const updatedParticipant = await tx.matchParticipant.update({
            where: {
              id: existing.id,
            },
            data: {
              status: ParticipantStatus.PENDING,
              introduction,
              responded_at: null,
              left_at: null,
            },
          });

          return updatedParticipant.id;
        }

        const createdParticipant = await tx.matchParticipant.create({
          data: {
            match_id: matchId,
            player_id: playerId,
            status: ParticipantStatus.PENDING,
            introduction,
          },
        });

        return createdParticipant.id;
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      },
    ),
  );
  const result = await getMappedParticipantById(participantId);
  const [matchMeta, requester] = await Promise.all([
    prisma.match.findUnique({
      where: { id: matchId },
      select: {
        title: true,
        creator: {
          select: {
            account_id: true,
          },
        },
      },
    }),
    prisma.player.findUnique({
      where: { id: playerId },
      select: {
        account: {
          select: {
            full_name: true,
          },
        },
      },
    }),
  ]);

  if (matchMeta?.creator.account_id && requester?.account.full_name) {
    await sendNotificationIfNotExists(matchMeta.creator.account_id, {
      message: `${requester.account.full_name} muốn tham gia kèo ${matchMeta.title} của bạn.`,
      type: "MATCH",
      target_role: "PLAYER",
      link_to: `/matches/${matchId}`,
    });
  }

  await invalidateMatchCaches(matchId);
  return result;
};

export const leaveMatch = async (playerId: string, matchId: string) => {
  const now = new Date();

  const participantId = await runSerializableWithRetry(() =>
    prisma.$transaction(
      async (tx) => {
        const participant = await tx.matchParticipant.findUnique({
          where: {
            match_id_player_id: {
              match_id: matchId,
              player_id: playerId,
            },
          },
          include: {
            match: {
              select: {
                id: true,
                status: true,
                slots_filled: true,
                version: true,
                booking: {
                  select: {
                    start_time: true,
                  },
                },
              },
            },
          },
        });

        if (!participant) {
          throw new NotFoundError("Join request not found");
        }

        if (
          participant.status === ParticipantStatus.WITHDRAWN ||
          participant.status === ParticipantStatus.REJECTED ||
          participant.status === ParticipantStatus.REMOVED
        ) {
          return participant.id;
        }

        if (participant.match.booking.start_time <= now) {
          throw new BadRequestError(
            "MATCH_STARTED: Cannot leave after match starts",
          );
        }

        if (
          participant.match.status === MatchStatus.CANCELED ||
          participant.match.status === MatchStatus.COMPLETED ||
          participant.match.status === MatchStatus.EXPIRED
        ) {
          throw new BadRequestError(
            "MATCH_CLOSED: Cannot leave this match anymore",
          );
        }

        const updatedParticipant = await tx.matchParticipant.update({
          where: {
            id: participant.id,
          },
          data: {
            status: ParticipantStatus.WITHDRAWN,
            left_at: now,
          },
        });

        if (participant.status === ParticipantStatus.ACCEPTED) {
          const matchData: Prisma.MatchUpdateManyMutationInput = {
            slots_filled: {
              decrement: 1,
            },
            version: {
              increment: 1,
            },
          };

          if (participant.match.status === MatchStatus.FULL) {
            matchData.status = MatchStatus.OPEN;
          }

          const updated = await tx.match.updateMany({
            where: {
              id: participant.match.id,
              version: participant.match.version,
              slots_filled: {
                gt: 0,
              },
            },
            data: matchData,
          });

          if (updated.count === 0) {
            throw new ConflictRequestError(
              "MATCH_SLOT_UPDATE_FAILED: Please retry",
            );
          }
        }

        return updatedParticipant.id;
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      },
    ),
  );
  const result = await getMappedParticipantById(participantId);
  await invalidateMatchCaches(matchId);
  return result;
};

export const getMyMatches = async (playerId: string, query: MyMatchesQuery) => {
  const page = query.page ?? 1;
  const limit = query.limit ?? 10;
  const skip = (page - 1) * limit;

  const where: Prisma.MatchWhereInput = {};

  if (query.status) {
    where.status = query.status as MatchStatus;
  }

  if (query.type === "created") {
    where.creator_id = playerId;
  }

  if (query.type === "joined") {
    where.participants = {
      some: {
        player_id: playerId,
        status: ParticipantStatus.ACCEPTED,
      },
    };
  }

  if (query.type === "pending") {
    where.participants = {
      some: {
        player_id: playerId,
        status: ParticipantStatus.PENDING,
      },
    };
  }

  const [total, matches] = await prisma.$transaction([
    prisma.match.count({ where }),
    prisma.match.findMany({
      where,
      orderBy: {
        created_at: "desc",
      },
      skip,
      take: limit,
      select: {
        ...matchListSelect,
        participants: {
          where: {
            player_id: playerId,
          },
          select: {
            status: true,
          },
          take: 1,
        },
      },
    }),
  ]);

  return {
    items: matches.map((match) => ({
      ...mapMatchListItem(match),
      my_participation_status: match.participants[0]?.status ?? null,
    })),
    pagination: {
      page,
      limit,
      total_items: total,
      total_pages: Math.ceil(total / limit),
      has_next: page * limit < total,
    },
  };
};

export const getMatchParticipants = async (
  creatorId: string,
  matchId: string,
  query: MatchParticipantsQuery,
) => {
  const match = await prisma.match.findFirst({
    where: {
      id: matchId,
      creator_id: creatorId,
    },
    select: {
      id: true,
      title: true,
      status: true,
      slots_needed: true,
      slots_filled: true,
    },
  });

  if (!match) {
    throw new NotFoundError("Match not found or you are not the creator");
  }

  const page = query.page ?? 1;
  const limit = query.limit ?? 10;
  const skip = (page - 1) * limit;

  const where: Prisma.MatchParticipantWhereInput = {
    match_id: matchId,
  };

  if (query.status) {
    where.status = query.status as ParticipantStatus;
  }

  if (query.q) {
    where.player = {
      account: {
        full_name: {
          contains: query.q,
          mode: "insensitive",
        },
      },
    };
  }

  const [total, participants] = await prisma.$transaction([
    prisma.matchParticipant.count({ where }),
    prisma.matchParticipant.findMany({
      where,
      orderBy: {
        created_at: "desc",
      },
      skip,
      take: limit,
      select: participantResponseSelect,
    }),
  ]);

  return {
    match,
    participants: participants.map(mapParticipantItem),
    pagination: {
      page,
      limit,
      total_items: total,
      total_pages: Math.ceil(total / limit),
      has_next: page * limit < total,
    },
  };
};

export const acceptMatchParticipant = async (
  creatorId: string,
  matchId: string,
  participantId: string,
) => {
  const now = new Date();

  const resolvedParticipantId = await runSerializableWithRetry(() =>
    prisma.$transaction(
      async (tx) => {
        const match = await tx.match.findFirst({
          where: {
            id: matchId,
            creator_id: creatorId,
          },
          select: {
            id: true,
            status: true,
            slots_needed: true,
            slots_filled: true,
            version: true,
            booking: {
              select: {
                start_time: true,
                end_time: true,
              },
            },
          },
        });

        if (!match) {
          throw new NotFoundError("Match not found or you are not the creator");
        }

        if (match.booking.start_time <= now) {
          throw new BadRequestError(
            "MATCH_STARTED: Cannot accept after match starts",
          );
        }

        if (
          match.status === MatchStatus.CANCELED ||
          match.status === MatchStatus.COMPLETED ||
          match.status === MatchStatus.EXPIRED ||
          match.status === MatchStatus.CLOSED
        ) {
          throw new BadRequestError(
            "MATCH_NOT_OPEN: Cannot accept in current status",
          );
        }

        const participant = await tx.matchParticipant.findFirst({
          where: {
            id: participantId,
            match_id: matchId,
          },
        });

        if (!participant) {
          throw new NotFoundError("Participant request not found");
        }

        if (participant.status === ParticipantStatus.ACCEPTED) {
          return participant.id;
        }

        if (participant.status !== ParticipantStatus.PENDING) {
          throw new BadRequestError("Only pending requests can be accepted");
        }

        const overlapAccepted = await tx.matchParticipant.findFirst({
          where: {
            player_id: participant.player_id,
            status: ParticipantStatus.ACCEPTED,
            match_id: {
              not: matchId,
            },
            match: {
              status: {
                not: MatchStatus.CANCELED,
              },
              booking: {
                start_time: {
                  lt: match.booking.end_time,
                },
                end_time: {
                  gt: match.booking.start_time,
                },
              },
            },
          },
          select: {
            id: true,
          },
        });

        if (overlapAccepted) {
          throw new ConflictRequestError(
            "MATCH_TIME_CONFLICT: Player already accepted in overlapping time",
          );
        }

        const slotUpdated = await tx.match.updateMany({
          where: {
            id: matchId,
            status: MatchStatus.OPEN,
            version: match.version,
            slots_filled: {
              lt: match.slots_needed,
            },
          },
          data: {
            slots_filled: {
              increment: 1,
            },
            version: {
              increment: 1,
            },
          },
        });

        if (slotUpdated.count === 0) {
          throw new ConflictRequestError("MATCH_FULL: Match already full");
        }

        const updatedParticipant = await tx.matchParticipant.update({
          where: {
            id: participant.id,
          },
          data: {
            status: ParticipantStatus.ACCEPTED,
            responded_at: now,
          },
        });

        if (match.slots_filled + 1 >= match.slots_needed) {
          const markedFull = await tx.match.updateMany({
            where: {
              id: matchId,
              status: MatchStatus.OPEN,
              version: match.version + 1,
              slots_filled: {
                gte: match.slots_needed,
              },
            },
            data: {
              status: MatchStatus.FULL,
              version: {
                increment: 1,
              },
            },
          });

          if (markedFull.count === 0) {
            throw new ConflictRequestError(
              "MATCH_STATE_CHANGED: Please retry",
            );
          }
        }

        return updatedParticipant.id;
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      },
    ),
  );
  const result = await getMappedParticipantById(resolvedParticipantId);
  const acceptedParticipant = await prisma.matchParticipant.findUnique({
    where: { id: resolvedParticipantId },
    select: {
      player: {
        select: {
          account_id: true,
        },
      },
      match: {
        select: {
          title: true,
        },
      },
    },
  });

  if (acceptedParticipant?.player.account_id) {
    await sendNotificationIfNotExists(acceptedParticipant.player.account_id, {
      message: `Yêu cầu tham gia kèo ${acceptedParticipant.match.title} của bạn đã được chấp nhận.`,
      type: "MATCH",
      target_role: "PLAYER",
      link_to: `/matches/${matchId}`,
    });
  }

  await invalidateMatchCaches(matchId);
  return result;
};

export const rejectMatchParticipant = async (
  creatorId: string,
  matchId: string,
  participantId: string,
) => {
  const now = new Date();

  const resolvedParticipantId = await runSerializableWithRetry(() =>
    prisma.$transaction(
      async (tx) => {
        const match = await tx.match.findFirst({
          where: {
            id: matchId,
            creator_id: creatorId,
          },
          select: {
            id: true,
            status: true,
            booking: {
              select: {
                start_time: true,
              },
            },
          },
        });

        if (!match) {
          throw new NotFoundError("Match not found or you are not the creator");
        }

        if (match.booking.start_time <= now) {
          throw new BadRequestError(
            "MATCH_STARTED: Cannot reject after match starts",
          );
        }

        if (
          match.status === MatchStatus.CANCELED ||
          match.status === MatchStatus.COMPLETED ||
          match.status === MatchStatus.EXPIRED ||
          match.status === MatchStatus.CLOSED
        ) {
          throw new BadRequestError(
            "MATCH_NOT_OPEN: Cannot reject in current status",
          );
        }

        const participant = await tx.matchParticipant.findFirst({
          where: {
            id: participantId,
            match_id: matchId,
          },
        });

        if (!participant) {
          throw new NotFoundError("Participant request not found");
        }

        if (participant.status === ParticipantStatus.REJECTED) {
          return participant.id;
        }

        if (participant.status !== ParticipantStatus.PENDING) {
          throw new BadRequestError("Only pending requests can be rejected");
        }

        const updated = await tx.matchParticipant.updateMany({
          where: {
            id: participant.id,
            status: ParticipantStatus.PENDING,
          },
          data: {
            status: ParticipantStatus.REJECTED,
            responded_at: now,
          },
        });

        if (updated.count === 0) {
          throw new ConflictRequestError(
            "PARTICIPANT_STATE_CHANGED: Please retry",
          );
        }

        return participant.id;
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      },
    ),
  );
  const result = await getMappedParticipantById(resolvedParticipantId);

  const rejectedParticipant = await prisma.matchParticipant.findUnique({
    where: { id: resolvedParticipantId },
    select: {
      player: {
        select: {
          account_id: true,
        },
      },
      match: {
        select: {
          title: true,
        },
      },
    },
  });

  if (rejectedParticipant?.player.account_id) {
    await sendNotificationIfNotExists(rejectedParticipant.player.account_id, {
      message: `Yêu cầu tham gia kèo ${rejectedParticipant.match.title} của bạn đã bị từ chối.`,
      type: "MATCH",
      target_role: "PLAYER",
      link_to: `/matches/${matchId}`,
    });
  }

  await invalidateMatchCaches(matchId);
  return result;
};

export const closeMatch = async (creatorId: string, matchId: string) => {
  const now = new Date();

  const match = await prisma.match.findFirst({
    where: {
      id: matchId,
      creator_id: creatorId,
    },
    select: {
      id: true,
      status: true,
      version: true,
      booking: {
        select: {
          start_time: true,
        },
      },
    },
  });

  if (!match) {
    throw new NotFoundError("Match not found or you are not the creator");
  }

  if (match.booking.start_time <= now) {
    throw new BadRequestError("Cannot close a match that has started");
  }

  if (
    match.status === MatchStatus.CANCELED ||
    match.status === MatchStatus.COMPLETED ||
    match.status === MatchStatus.EXPIRED
  ) {
    throw new BadRequestError("Match cannot be closed in current status");
  }

  if (match.status === MatchStatus.CLOSED) {
    return getMappedMatchById(matchId);
  }

  const updated = await prisma.match.updateMany({
    where: {
      id: match.id,
      version: match.version,
    },
    data: {
      status: MatchStatus.CLOSED,
      version: {
        increment: 1,
      },
    },
  });

  if (updated.count === 0) {
    throw new ConflictRequestError("MATCH_STATE_CHANGED: Please retry");
  }

  const result = await getMappedMatchById(match.id);
  await invalidateMatchCaches(match.id);
  return result;
};

export const reopenMatch = async (creatorId: string, matchId: string) => {
  const now = new Date();

  const match = await prisma.match.findFirst({
    where: {
      id: matchId,
      creator_id: creatorId,
    },
    select: {
      id: true,
      status: true,
      slots_needed: true,
      slots_filled: true,
      version: true,
      join_deadline: true,
      booking: {
        select: {
          start_time: true,
        },
      },
    },
  });

  if (!match) {
    throw new NotFoundError("Match not found or you are not the creator");
  }

  if (match.status !== MatchStatus.CLOSED) {
    throw new BadRequestError("Only CLOSED match can be reopened");
  }

  if (match.booking.start_time <= now) {
    throw new BadRequestError("Cannot reopen match after start time");
  }

  if (match.join_deadline && match.join_deadline <= now) {
    throw new BadRequestError("Cannot reopen match after join deadline");
  }

  const nextStatus =
    match.slots_filled >= match.slots_needed
      ? MatchStatus.FULL
      : MatchStatus.OPEN;

  const updated = await prisma.match.updateMany({
    where: {
      id: match.id,
      version: match.version,
    },
    data: {
      status: nextStatus,
      version: {
        increment: 1,
      },
    },
  });

  if (updated.count === 0) {
    throw new ConflictRequestError("MATCH_STATE_CHANGED: Please retry");
  }

  const result = await getMappedMatchById(match.id);
  await invalidateMatchCaches(match.id);
  return result;
};

export const cancelMatch = async (creatorId: string, matchId: string) => {
  const now = new Date();

  const match = await prisma.match.findFirst({
    where: {
      id: matchId,
      creator_id: creatorId,
    },
    select: {
      id: true,
      status: true,
      version: true,
      booking: {
        select: {
          start_time: true,
        },
      },
    },
  });

  if (!match) {
    throw new NotFoundError("Match not found or you are not the creator");
  }

  if (
    match.status === MatchStatus.CANCELED ||
    match.status === MatchStatus.COMPLETED
  ) {
    throw new BadRequestError("Match cannot be canceled in current status");
  }

  if (match.booking.start_time <= now) {
    throw new BadRequestError("Cannot cancel match after start time");
  }

  const updated = await prisma.match.updateMany({
    where: {
      id: match.id,
      version: match.version,
    },
    data: {
      status: MatchStatus.CANCELED,
      version: {
        increment: 1,
      },
    },
  });

  if (updated.count === 0) {
    throw new ConflictRequestError("MATCH_STATE_CHANGED: Please retry");
  }

  const result = await getMappedMatchById(match.id);
  await invalidateMatchCaches(match.id);
  return result;
};

export const syncMatchStatusesByTime = async () => {
  const now = new Date();

  await prisma.match.updateMany({
    where: {
      status: {
        in: [MatchStatus.FULL, MatchStatus.CLOSED],
      },
      booking: {
        end_time: {
          lte: now,
        },
      },
    },
    data: {
      status: MatchStatus.COMPLETED,
      version: {
        increment: 1,
      },
    },
  });

  await prisma.match.updateMany({
    where: {
      status: {
        in: [MatchStatus.OPEN, MatchStatus.CLOSED],
      },
      OR: [
        {
          join_deadline: {
            lt: now,
          },
        },
        {
          booking: {
            start_time: {
              lte: now,
            },
          },
        },
      ],
    },
    data: {
      status: MatchStatus.EXPIRED,
      version: {
        increment: 1,
      },
    },
  });

  await invalidateMatchCaches();
};

export const cancelMatchesByCanceledBookings = async () => {
  await prisma.match.updateMany({
    where: {
      status: {
        not: MatchStatus.CANCELED,
      },
      booking: {
        status: BookingStatus.CANCELED,
      },
    },
    data: {
      status: MatchStatus.CANCELED,
      version: {
        increment: 1,
      },
    },
  });

  await invalidateMatchCaches();
};
