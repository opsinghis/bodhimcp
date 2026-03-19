import styles from './WorkflowCard.module.css';

type Props = {
  title: string;
  variant?: 'default' | 'grid';
  children: React.ReactNode;
};

export default function WorkflowCard({ title, variant = 'default', children }: Props) {
  return (
    <section className={styles.card}>
      <h3 className={styles.title}>{title}</h3>
      <div className={variant === 'grid' ? styles.grid : undefined}>{children}</div>
    </section>
  );
}
