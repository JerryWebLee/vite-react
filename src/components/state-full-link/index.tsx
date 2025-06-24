import { Link, LinkProps, useLocation } from "react-router-dom";

export function StateFullLink({ to, children, ...props }: LinkProps) {
  const location = useLocation();

  return (
    <Link to={to} state={location.state} {...props}>
      {children}
    </Link>
  );
}
