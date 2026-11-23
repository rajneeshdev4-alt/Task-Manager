import { Modal } from './Modal';
import { Button } from './Button';

export function ConfirmDialog({ open, title, description, confirmLabel = 'Confirm', loading, onConfirm, onClose }) {
  return (
    <Modal open={open} title={title} description={description} onClose={onClose}>
      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button variant="danger" onClick={onConfirm} disabled={loading}>
          {loading ? 'Deleting...' : confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
