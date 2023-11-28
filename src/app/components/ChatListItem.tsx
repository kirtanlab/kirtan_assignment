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

const ChatListItem = ({
  chat,
  toastError,
  onDelete,
  toastSuccess,
  onSelect,
  chatId,
}) => {
  const handleDelete = (e) => {
    e.stopPropagation();
    // Handle the delete action here
    const status = onDelete(chat.id);
    console.log("deleted status", status);

    toastSuccess("Deleted chat");
  };

  // onSelect

  return (
    <div className="px-1 pt-2 text-base">
      <Button
        onClick={() => onSelect(chat.id)}
        className={` rounded-sm outline-2  ${
          chatId === chat.id ? "bg-slate-700" : ""
        } text-white hover:bg-slate-800`}
      >
        <div className="mr-2 inline-block">{chat.chat_name}</div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <div
              className="inline-block"
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <Icons.trash className="h-4 w-4" />
            </div>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete chat</AlertDialogTitle>
              <Separator />
              <AlertDialogDescription>
                This will delete selected chat
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="text-white bg-green-700  font-bold hover:bg-green-900 hover:text-white">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="text-white bg-red-700 font-bold hover:bg-red-900"
              >
                Continue
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </Button>
    </div>
  );
};
export default ChatListItem;
