import style from "./index.module.css";

type ButtonProps = {
  children: React.ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

export function Button({ children, ...props }: ButtonProps) {
  return (
    <button {...props} className={style["button-wrapper"]}>
      {children}
    </button>
  );
}
