import style from "./index.module.css";

type InputProps = {
  children?: React.ReactNode;
} & React.InputHTMLAttributes<HTMLInputElement>;

export default function Input({ children, ...props }: InputProps) {
  return (
    <>
      {children && <h3>{children}</h3>}
      <input type="text" className={style["input"]} {...props} />
    </>
  );
}
