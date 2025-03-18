import { useState } from "react";
import { requestPermission } from "@/app/util/permission";
import { Button } from "@/components/Button";
import Input from "@/components/Input";
import style from "./index.module.css";

type PermissionProps = {
  sendMessage: (message: string) => void;
  messages: string[];
};

export default function Permission({ sendMessage }: PermissionProps) {
  const [userName, setUserName] = useState("");
  const [waiting, setWaiting] = useState(false);

  const handleClick = () => {
    requestPermission().then((response) => {
      if (response) {
        sendMessage("user" + userName);
        setWaiting(true);
      }
    });
  };

  return (
    <>
      {waiting ? (
        <h1>参加待ち</h1>
      ) : (
        <div className={style["permission-wrapper"]}>
          <Input
            onChange={(e) => {
              setUserName(e.target.value);
            }}
            value={userName}
          >
            ユーザ名
          </Input>
          <Button onClick={handleClick}>
            <h3>参加</h3>
          </Button>
        </div>
      )}
    </>
  );
}
