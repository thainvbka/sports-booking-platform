// ============================================================
//  ENUMS
// ============================================================

Enum "SportType" {
  "FOOTBALL"
  "BASKETBALL"
  "TENNIS"
  "BADMINTON"
  "VOLLEYBALL"
  "PICKLEBALL"
}

Enum "BookingStatus" {
  "PENDING"
  "CONFIRMED"
  "CANCELED"
  "COMPLETED"
}

Enum "PaymentProvider" {
  "STRIPE"
  "MOMO"
  "VNPAY"
}

Enum "PaymentStatus" {
  "SUCCESS"
  "FAILED"
  "REFUNDED"
}

Enum "PayoutStatus" {
  "PENDING"
  "REQUESTED"
  "PROCESSING"
  "PAID"
  "CANCELLED"
}

Enum "AdminStatus" {
  "ACTIVE"
  "INACTIVE"
}

Enum "PlayerStatus" {
  "ACTIVE"
  "BANNED"
}

Enum "OwnerStatus" {
  "ACTIVE"
  "SUSPENDED"
}

Enum "RecurrenceType" {
  "WEEKLY"
  "MONTHLY"
}

Enum "RecurringStatus" {
  "PENDING"
  "CONFIRMED"
  "CANCELED"
  "COMPLETED"
}

Enum "ComplexStatus" {
  "DRAFT"
  "PENDING"
  "ACTIVE"
  "REJECTED"
  "INACTIVE"
}

Enum "ProductStatus" {
  "ACTIVE"
  "INACTIVE"
}

Enum "ProductType" {
  "SALE"
  "RENTAL"
}

Enum "MatchStatus" {
  "OPEN"
  "FULL"
  "CLOSED"
  "EXPIRED"
  "CANCELED"
  "COMPLETED"
}

Enum "ParticipantStatus" {
  "PENDING"
  "ACCEPTED"
  "REJECTED"
  "WITHDRAWN"
  "REMOVED"
}

Enum "MatchSkillLevel" {
  "BEGINNER"
  "INTERMEDIATE"
  "ADVANCED"
}

Enum "NotificationTargetRole" {
  "PLAYER"
  "OWNER"
  "ADMIN"
}

// ============================================================
//  TABLES
// ============================================================

Table "Account" {
  "id"                        UUID       
  "email"                     VARCHAR
  "password"                  TEXT        
  "full_name"                 VARCHAR
  "phone_number"              VARCHAR
  "avatar"                    TEXT
  "email_verified"            BOOLEAN     
  "phone_verified"            BOOLEAN     
  "verification_token"        TEXT        
  "verification_expires_at"   TIMESTAMPTZ
  "reset_password_token"      TEXT        
  "reset_password_expires_at" TIMESTAMPTZ
}

Table "Admin" {
  "id"         UUID       
  "account_id" UUID       
  "status"     AdminStatus 
}

Table "Owner" {
  "id"                         UUID        
  "account_id"                 UUID        
  "company_name"               VARCHAR 
  "stripe_account_id"          VARCHAR
  "stripe_onboarding_complete" BOOLEAN     
  "status"                     OwnerStatus 
  // Domestic bank account for VNPAY payouts
  "bank_name"                  VARCHAR
  "bank_account_number"        VARCHAR(50)
  "bank_account_name"          VARCHAR
  "bank_branch"                VARCHAR(150)
}

Table "Player" {
  "id"         UUID         
  "account_id" UUID         
  "status"     PlayerStatus 
}

Table "RefreshToken" {
  "id"         UUID    
  "token"      TEXT    
  "account_id" UUID    
  "revoked"    BOOLEAN 

}

// Table "SocialAccount" {
//   "id"          UUID        
//   "provider"    VARCHAR(50) 
//   "provider_id" VARCHAR 
//   "account_id"  UUID        

//   Indexes {
//     (provider, provider_id) [unique, name: "SocialAccount_provider_provider_id_key"]
//     (account_id, provider)  [unique, name: "SocialAccount_account_id_provider_key"]
//     account_id              [name: "SocialAccount_account_id_idx"]
//   }
// }

Table "Complex" {
  "id"                UUID          
  "owner_id"          UUID          
  "complex_name"      VARCHAR
  "complex_address"   TEXT          
  "status"            ComplexStatus 
  "verification_docs" JSON          
  "complex_image"     TEXT
  "min_price"         INTEGER
  "max_price"         INTEGER
  "total_subfields"   SMALLINT      
  "sport_types"       "VARCHAR(50)[]" 
  "avg_rating"        DECIMAL
  "total_reviews"     INTEGER       

}

Table "SubField" {
  "id"                   UUID      
  "complex_id"           UUID      
  "sub_field_name"       VARCHAR 
  "capacity"             SMALLINT  
  "sub_field_image"      TEXT
  "sport_type"           SportType 
  "isDelete"             BOOLEAN   
  "avg_rating"           DECIMAL
  "total_reviews"        INTEGER   
  "embedding"            "vector(8)"
  "embedding_updated_at" TIMESTAMPTZ

}

Table "PricingRule" {
  "id"           UUID        
  "sub_field_id" UUID        
  "day_of_week"  SMALLINT    
  "start_time"   TIME     
  "end_time"     TIME     
  "base_price"   DECIMAL 

}

Table "RecurringBooking" {
  "id"              UUID           
  "player_id"       UUID           
  "sub_field_id"    UUID           
  "recurrence_type" RecurrenceType 
  "start_date"      DATE           
  "end_date"        DATE           
  "status"          RecurringStatus 

}

Table "Booking" {
  "id"                   UUID          
  "start_time"           TIMESTAMPTZ 
  "end_time"             TIMESTAMPTZ 
  "total_price"          DECIMAL 
  "status"               BookingStatus 
  "expires_at"           TIMESTAMPTZ 
  "rental_returned"      BOOLEAN       
  "player_id"            UUID          
  "sub_field_id"         UUID          
  "payment_id"           UUID
  "recurring_booking_id" UUID

}

Table "Payment" {
  "id"               UUID            
  "amount"           DECIMAL   
  "provider"         PaymentProvider 
  "transaction_code" TEXT            
  "status"           PaymentStatus   
}

Table "Notification" {
  "id"          UUID                  
  "account_id"  UUID                  
  "message"     TEXT                  
  "is_read"     BOOLEAN               
  "type"        TEXT                  
  "target_role" NotificationTargetRole 
  "link_to"     TEXT

 
}

Table "Product" {
  "id"          UUID          
  "complex_id"  UUID          
  "sport_type"  SportType
  "name"        VARCHAR(200)  
  "description" TEXT
  "price"       DECIMAL 
  "stock"       INTEGER       
  "image"       TEXT
  "status"      ProductStatus 
  "type"        ProductType  

 
}

Table "BookingAddon" {
  "id"         UUID          
  "booking_id" UUID          
  "product_id" UUID          
  "quantity"   INTEGER       
  "unit_price" DECIMAL 

 
}

Table "Match" {
  "id"            UUID           
  "booking_id"    UUID           
  "creator_id"    UUID           
  "sport_type"    SportType      
  "skill_level"   MatchSkillLevel
  "title"         VARCHAR(200)   
  "description"   TEXT
  "slots_needed"  SMALLINT       
  "slots_filled"  SMALLINT       
  "join_deadline" TIMESTAMPTZ
  "status"        MatchStatus    
  "closed_reason" VARCHAR(200)

  
}

Table "MatchParticipant" {
  "id"           UUID              
  "match_id"     UUID              
  "player_id"    UUID              
  "status"       ParticipantStatus
  "introduction" TEXT
  "responded_at" TIMESTAMPTZ
  "left_at"      TIMESTAMPTZ


}

Table "Review" {
  "id"          UUID          
  "booking_id"  UUID          
  "player_id"   UUID          
  "subfield_id" UUID          
  "rating"      SMALLINT     
  "comment"     VARCHAR(500)
  "images"      "TEXT[]"      

 
}

Table "OwnerPayout" {
  "id"           UUID         
  "owner_id"     UUID         
  "payment_id"   UUID         
  "batch_id"     UUID
  "total_amount" DECIMAL 
  "platform_fee" DECIMAL 
  "payout_amount" DECIMAL 
  "status"       PayoutStatus 


}

Table "PayoutBatch" {
  "id"              UUID         
  "owner_id"        UUID         
  "total_payout"    DECIMAL 
  "status"          PayoutStatus
  "payout_period"   VARCHAR(50)  
  "transaction_ref" VARCHAR
  "note"            TEXT


}

// ============================================================
//  REFERENCES
// ============================================================

Ref: "Account"."id" < "Admin"."account_id"           [delete: cascade]
Ref: "Account"."id" < "Owner"."account_id"           [delete: cascade]
Ref: "Account"."id" < "Player"."account_id"          [delete: cascade]
Ref: "Account"."id" < "RefreshToken"."account_id"    [delete: cascade]
// Ref: "Account"."id" < "SocialAccount"."account_id"   [delete: cascade]
Ref: "Account"."id" < "Notification"."account_id"    [delete: cascade]

Ref: "Owner"."id"   < "Complex"."owner_id"           [delete: restrict]
Ref: "Owner"."id"   < "OwnerPayout"."owner_id"       [delete: cascade]
Ref: "Owner"."id"   < "PayoutBatch"."owner_id"       [delete: cascade]

Ref: "Complex"."id" < "SubField"."complex_id"        [delete: restrict]
Ref: "Complex"."id" < "Product"."complex_id"         [delete: cascade]

Ref: "SubField"."id" < "PricingRule"."sub_field_id"        [delete: cascade]
Ref: "SubField"."id" < "RecurringBooking"."sub_field_id"   [delete: cascade]
Ref: "SubField"."id" < "Booking"."sub_field_id"            [delete: restrict]
Ref: "SubField"."id" < "Review"."subfield_id"              [delete: cascade]

Ref: "Player"."id"  < "RecurringBooking"."player_id" [delete: cascade]
Ref: "Player"."id"  < "Booking"."player_id"          [delete: restrict]
Ref: "Player"."id"  < "Match"."creator_id"           [delete: cascade]
Ref: "Player"."id"  < "MatchParticipant"."player_id" [delete: cascade]
Ref: "Player"."id"  < "Review"."player_id"           [delete: cascade]

Ref: "Payment"."id" < "Booking"."payment_id"
Ref: "Payment"."id" < "OwnerPayout"."payment_id"     [delete: restrict]

Ref: "RecurringBooking"."id" < "Booking"."recurring_booking_id"

Ref: "Booking"."id" < "BookingAddon"."booking_id"    [delete: cascade]
Ref: "Booking"."id" < "Match"."booking_id"           [delete: cascade]
Ref: "Booking"."id" < "Review"."booking_id"          [delete: cascade]

Ref: "Product"."id" < "BookingAddon"."product_id"    [delete: restrict]

Ref: "Match"."id"   < "MatchParticipant"."match_id"  [delete: cascade]

Ref: "PayoutBatch"."id" < "OwnerPayout"."batch_id"   [delete: set null]
