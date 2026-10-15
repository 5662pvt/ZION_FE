import type { Key, ReactNode } from "react";
import styles from "./ListCard.module.css";

export interface ListCardField {
  label: string;
  value: ReactNode;
}

interface ListCardProps {
  title: ReactNode;
  status?: ReactNode;
  fields: ListCardField[];
  action?: ReactNode;
}

export default function ListCard({ title, status, fields, action }: ListCardProps) {
  return (
    <div className={styles.card}>
      <div className={styles.head}>
        <div className={styles.title}>{title}</div>
        {status}
      </div>
      <div className={styles.fields}>
        {fields.map((field, index): ReactNode => {
          const key: Key = `${field.label}-${index}`;
          return (
            <div className={styles.field} key={key}>
              <span className={styles.label}>{field.label}</span>
              <span className={styles.value}>{field.value}</span>
            </div>
          );
        })}
      </div>
      {action && <div className={styles.action}>{action}</div>}
    </div>
  );
}
