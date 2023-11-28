import { Button } from "./ui/button";
import { Icons } from "./ui/icons";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogDescription,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogTrigger,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogAction,
} from "./ui/alert-dialog";
import { Separator } from "./ui/separator";
import { getAllmessages } from "@/lib/utils";

const Newchat = ({ onSelect, active = true }) => {
  return (
    <Button
      onClick={() => onSelect("")}
      className={`mt-4 text-base rounded-sm outline-2 ${
        active ? "bg-slate-700" : ""
      } text-white hover:bg-slate-800`}
    >
      <div className="justify-start mr-16 text-bold ">New chat</div>
      <div className="ml-2 justify-end ">
        <Icons.plus className="h-4 w-4" />
      </div>
    </Button>
  );
};
export default Newchat;
