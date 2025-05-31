import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { FaLockOpen, FaTrash } from 'react-icons/fa';

function Toolbar({ selectedUsers, onBlock, onUnblock, onDelete }) {
    return (
        <div className="mb-3 d-flex gap-2 align-items-center">
            <OverlayTrigger overlay={<Tooltip>Block selected users</Tooltip>}>
                <button
                    className="btn btn-danger"
                    onClick={() => onBlock(selectedUsers)}
                    disabled={selectedUsers.length === 0}
                    style={{ padding: '6px 12px' }}
                >
                    Block
                </button>
            </OverlayTrigger>
            <OverlayTrigger overlay={<Tooltip>Unblock selected users</Tooltip>}>
                <button
                    className="btn btn-success"
                    onClick={() => onUnblock(selectedUsers)}
                    disabled={selectedUsers.length === 0}
                    style={{ padding: '6px 10px' }}
                >
                    <FaLockOpen size={16} />
                </button>
            </OverlayTrigger>
            <OverlayTrigger overlay={<Tooltip>Delete selected users</Tooltip>}>
                <button
                    className="btn btn-danger"
                    onClick={() => onDelete(selectedUsers)}
                    disabled={selectedUsers.length === 0}
                    style={{ padding: '6px 10px' }}
                >
                    <FaTrash size={16} />
                </button>
            </OverlayTrigger>
        </div>
    );
}

export default Toolbar;