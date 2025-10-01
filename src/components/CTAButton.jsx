import React from "react";
export default function CTAButton({ children, variant="solid", ...props }){
  return <button className={variant==="ghost" ? "btn ghost" : "btn"} {...props}>{children}</button>;
}
