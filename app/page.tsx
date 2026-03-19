'use client';

import { useState } from 'react';
import { tabs } from './data/tabs';
import TabBar from './components/TabBar';
import WorkflowCard from './components/WorkflowCard';
import styles from './page.module.css';

export default function Home() {
  const [activeTab, setActiveTab] = useState(0);
  const tab = tabs[activeTab];
  const accent = tab.color;

  // Group workflow nodes: consecutive parallel nodes form a group
  const groupedNodes = groupWorkflowNodes(tab.workflowNodes);

  return (
    <div className={styles.page}>
      <p className={styles.header}>PANDORA × MCP</p>

      <TabBar
        tabs={tabs.map((t) => ({ label: t.label, color: t.color }))}
        active={activeTab}
        onChange={setActiveTab}
      />

      <div className={styles.content} key={activeTab}>
        {/* Hero */}
        <section className={styles.hero}>
          <span className={styles.badge} style={{ borderColor: accent, color: accent }}>
            {tab.badge}
          </span>
          <h1 className={styles.heroTitle}>{tab.title}</h1>
          <p className={styles.heroDesc}>{tab.description}</p>
          <div className={styles.statsRow}>
            {tab.stats.map((s) => (
              <div key={s.label} className={styles.stat}>
                <div className={styles.statValue} style={{ color: accent }}>
                  {s.value}
                </div>
                <div className={styles.statLabel}>{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Workflow */}
        <WorkflowCard title="Workflow Architecture">
          <div className={styles.workflow}>
            {groupedNodes.map((group, gi) => (
              <div key={gi}>
                {group.length === 1 ? (
                  <NodeItem node={group[0]} accent={accent} />
                ) : (
                  <div className={styles.parallelGroup}>
                    {group.map((node) => (
                      <NodeItem key={node.index} node={node} accent={accent} />
                    ))}
                  </div>
                )}
                {gi < groupedNodes.length - 1 && (
                  <div className={styles.connector} style={{ background: accent }} />
                )}
              </div>
            ))}
          </div>
        </WorkflowCard>

        {/* Tools */}
        <WorkflowCard title="MCP Tools" variant="grid">
          {tab.tools.map((tool) => (
            <div key={tool.name} className={styles.toolCard}>
              <div className={styles.toolName} style={{ color: accent }}>
                {tool.name}
              </div>
              <div className={styles.toolDesc}>{tool.description}</div>
            </div>
          ))}
        </WorkflowCard>

        {/* Features */}
        <WorkflowCard title="Key Features">
          {tab.features.map((f) => (
            <div key={f.title} className={styles.featureItem}>
              <div className={styles.featureTitle}>{f.title}</div>
              <div className={styles.featureDesc}>{f.description}</div>
            </div>
          ))}
        </WorkflowCard>
      </div>
    </div>
  );
}

type IndexedNode = { label: string; description: string; type: string; parallel?: boolean; loopBack?: string; index: number };

function groupWorkflowNodes(
  nodes: { label: string; description: string; type: string; parallel?: boolean }[]
): IndexedNode[][] {
  const groups: IndexedNode[][] = [];
  let currentParallel: IndexedNode[] = [];

  nodes.forEach((node, i) => {
    const indexed = { ...node, index: i };
    if (node.parallel) {
      currentParallel.push(indexed);
    } else {
      if (currentParallel.length > 0) {
        groups.push(currentParallel);
        currentParallel = [];
      }
      groups.push([indexed]);
    }
  });

  if (currentParallel.length > 0) {
    groups.push(currentParallel);
  }

  return groups;
}

function NodeItem({ node, accent }: { node: IndexedNode; accent: string }) {
  return (
    <div className={styles.node}>
      <div
        className={styles.nodeNumber}
        data-type={node.type}
        style={{ borderColor: accent, color: accent }}
      >
        {node.index + 1}
      </div>
      <div className={styles.nodeBody}>
        <div className={styles.nodeLabel}>{node.label}</div>
        <div className={styles.nodeDesc}>{node.description}</div>
        {node.loopBack && (
          <div className={styles.loopBack} style={{ color: accent, borderColor: accent }}>
            ↩ Loop back to {node.loopBack}
          </div>
        )}
      </div>
    </div>
  );
}
