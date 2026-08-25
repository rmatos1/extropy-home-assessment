import { NavLink } from "react-router";

type LinkComponentProps = {
  to: string;
  text: string;
};

export const LinkComponent = ({ to, text }: LinkComponentProps) => {
  return (
    <NavLink to={to} className="text-blue-500 hover:text-blue-700">
      {text}
    </NavLink>
  );
};
