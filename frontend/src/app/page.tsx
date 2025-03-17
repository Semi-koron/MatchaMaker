import { Button } from "@/components/Button";
import style from "./page.module.css";

export default function Title() {
  return (
    <div className={style["title-wrapper"]}>
      <h1>Matcha Maker</h1>
      <Button>
        <h3>抹茶を挽く</h3>
      </Button>
    </div>
  );
}
