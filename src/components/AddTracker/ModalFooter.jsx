import { useNavigate } from 'react-router-dom'
import Button from '../Button'

export default function ModalFooter({ isEnabled, onConfirm }) {
  const navigate = useNavigate()

  return (
    <div className="p-4 px-6 md:px-8 bg-white/2 border-t border-white/6 flex gap-3 shrink-0">
      <Button
        variant="outline"
        onClick={() => navigate(-1)}
        className="flex-1 !py-3"
      >
        Cancel
      </Button>
      <Button
        variant="primary"
        onClick={onConfirm}
        disabled={!isEnabled}
        className="flex-2 !py-3"
      >
        Confirm Selection
      </Button>
    </div>
  )
}