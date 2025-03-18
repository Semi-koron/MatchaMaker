import { requestPermission } from "@/app/util/permission";
import { Button } from "@/components/Button";

export default function PermissionPage() {
  const handleClick = () => {
    requestPermission();
  };

  return (
    <div>
      <Button onClick={handleClick}>
        <h3>コントローラーでOK</h3>
      </Button>
    </div>
  );
}
