import styles from './TabBar.module.css';

type Tab = { label: string; color: string };

type Props = {
  tabs: Tab[];
  active: number;
  onChange: (index: number) => void;
};

export default function TabBar({ tabs, active, onChange }: Props) {
  return (
    <nav className={styles.tabBar}>
      {tabs.map((tab, i) => (
        <button
          key={tab.label}
          className={`${styles.tab} ${i === active ? styles.tabActive : ''}`}
          style={i === active ? { borderBottomColor: tab.color, color: tab.color } : undefined}
          onClick={() => onChange(i)}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
}
