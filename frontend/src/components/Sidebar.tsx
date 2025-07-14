import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Drawer, Menu } from 'antd';
import { MenuOutlined } from '@ant-design/icons';

export default function Sidebar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        type="text"
        icon={<MenuOutlined />}
        aria-label="Toggle navigation"
        className="md:hidden"
        onClick={() => setOpen(true)}
      />
      <Drawer
        title="Navigation"
        placement="left"
        onClose={() => setOpen(false)}
        open={open}
        className="md:hidden"
      >
        <Menu mode="inline" onClick={() => setOpen(false)}>
          <Menu.Item key="dashboard">
            <Link to="/">Dashboard</Link>
          </Menu.Item>
          <Menu.Item key="analytics">
            <Link to="/analytics">Analytics</Link>
          </Menu.Item>
        </Menu>
      </Drawer>
      <nav className="hidden md:block w-48">
        <Menu mode="vertical" selectable={false}>
          <Menu.Item key="d">
            <Link to="/">Dashboard</Link>
          </Menu.Item>
          <Menu.Item key="a">
            <Link to="/analytics">Analytics</Link>
          </Menu.Item>
        </Menu>
      </nav>
    </>
  );
}
