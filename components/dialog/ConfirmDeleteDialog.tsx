import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'

type ConfirmDeleteDialogProps = {
  itemId: string
  type: string
  onConfirm: (id: string) => void
}

export function ConfirmDeleteDialog({
  itemId,
  onConfirm,
  type,
}: ConfirmDeleteDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className='text-destructive hover:underline cursor-pointer'>
          <Trash2 size={16} />
        </button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete {type}?</DialogTitle>
        </DialogHeader>

        <p>This action cannot be undone.</p>

        <DialogFooter>
          <DialogClose>Cancel</DialogClose>

          {/* Confirm button */}
          <Button
            variant='destructive'
            onClick={() => onConfirm(itemId)}
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
