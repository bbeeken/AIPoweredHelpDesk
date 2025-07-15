import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal, Input, List } from 'antd';

interface Option {
  label: string;
  path: string;
}

const options: Option[] = [
  { label: 'Dashboard', path: '/' },
  { label: 'Analytics', path: '/analytics' },
];

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen(o => !o);
      }
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  function handleSelect(opt: Option) {
    navigate(opt.path);
    setOpen(false);
    setQuery('');
  }

  const filtered = options.filter(o =>
    o.label.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <Modal
      open={open}
      onCancel={() => setOpen(false)}
      footer={null}
      title="Commands"
      afterOpenChange={open => !open && setQuery('')}
    >
      <Input
        autoFocus
        placeholder="Type a command..."
        value={query}
        onChange={e => setQuery(e.target.value)}
        className="mb-2"
      />
      <List
        dataSource={filtered}
        renderItem={item => (
          <List.Item>
            <button className="w-full text-left touch-target" onClick={() => handleSelect(item)}>
              {item.label}
            </button>
          </List.Item>
        )}
        locale={{ emptyText: 'No results' }}
      />
    </Modal>
  );
}
