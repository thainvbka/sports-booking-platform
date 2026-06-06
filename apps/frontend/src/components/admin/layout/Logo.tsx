import * as React from "react";

interface LogoProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
}

export function Logo({ size = 24, className, ...props }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <path
        d="M27 32h-9.1c-1.5 0-2.8-.6-3.9-1.6L.3 16.7c-.4-.4-.4-1 0-1.4s1-.4 1.4 0L15.4 29c.7.6 1.5 1 2.5 1H27c.6 0 1 .4 1 1s-.4 1-1 1z"
        fill="currentColor"
      />
      <path
        d="M27.1 23H17c-.6 0-1-.4-1-1s.4-1 1-1h5.8c-.4-.3-.7-.6-1-1H15c-.6 0-1-.4-1-1s.4-1 1-1h5.6c-.4-1.1-.6-2.4-.6-4 0-.3-.1-.5-.3-.7-.2-.2-.4-.3-.7-.3h-1c-3.3 0-7-3.7-7-7 0-.4-.3-.8-.6-.9-.4-.2-.9-.1-1.2.2l-7 8c-.3.4-.3 1 0 1.4L15 27.4c1 1 2.4 1.6 3.9 1.6H27c.5 0 .9-.3 1-.8l.4-1.8c.2-.9.1-1.8-.4-2.5-.2-.3-.5-.6-.9-.9zM10.5 18C9.1 18 8 16.9 8 15.5S9.1 13 10.5 13s2.5 1.1 2.5 2.5S11.9 18 10.5 18z"
        fill="currentColor"
      />
      <path
        d="M19 15.7c-.4 0-.8-.3-1-.7-.7-2.6 0-5.5 2-7.4l7.3-7.3c.4-.4 1-.4 1.4 0s.4 1 0 1.4L21.4 9c-1.4 1.4-2 3.5-1.5 5.5.1.5-.2 1.1-.7 1.2-.1 0-.2 0-.2 0z"
        fill="currentColor"
      />
      <path
        d="M10 8c-.4 0-.8-.3-.9-.7-.2-.5.1-1.1.6-1.2 1.7-.6 3.2-1.7 4.1-3.3l1.4-2.3c.3-.5.9-.6 1.4-.4.5.3.6.9.4 1.4l-1.4 2.3c-1.2 2-3 3.4-5.2 4.1-.1 0-.2 0-.3 0z"
        fill="currentColor"
      />
    </svg>
  );
}
