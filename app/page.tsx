'use client';

import { useState } from 'react';
import { tabs, builders } from './data/tabs';
import TabBar from './components/TabBar';
import WorkflowCard from './components/WorkflowCard';
import styles from './page.module.css';

export default function Home() {
  const [activeTab, setActiveTab] = useState(0);
  const [activeBuilder, setActiveBuilder] = useState(0);
  const tab = tabs[activeTab];
  const builder = builders[activeBuilder];
  const accent = tab.color;

  const groupedNodes = groupWorkflowNodes(tab.workflowNodes);

  return (
    <div className={styles.page}>
      <p className={styles.header}>BODHI × MCP</p>

      {/* ── Landing Hero ── */}
      <section className={styles.landing}>
        <h1 className={styles.landingTitle}>Agentic Workflow Platform</h1>
        <p className={styles.landingDesc}>
          Design, build, and run MCP-powered agentic workflows.
          Go from a one-sentence brief to a full design document to production-ready workflow JSON — or explore the three built-in workflows that power Pandora&apos;s AI commerce stack.
        </p>
        <div className={styles.landingPipeline}>
          <PipelineStep
            number="1"
            label="Brief"
            description="1-3 sentence requirement"
            color="var(--tab-design-builder)"
          />
          <div className={styles.pipelineArrow}>→</div>
          <PipelineStep
            number="2"
            label="Design Doc"
            description="Full architecture + prompts"
            color="var(--tab-design-builder)"
            link="Design Doc Generator"
          />
          <div className={styles.pipelineArrow}>→</div>
          <PipelineStep
            number="3"
            label="Workflow JSON"
            description="Engine-ready, validated"
            color="var(--tab-workflow-builder)"
            link="Workflow Builder"
          />
          <div className={styles.pipelineArrow}>→</div>
          <PipelineStep
            number="4"
            label="Running Workflow"
            description="Visual editor + execution"
            color="var(--text-muted)"
          />
        </div>
      </section>

      {/* ── Builders Section ── */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Builders</h2>
        <p className={styles.sectionDesc}>
          Two meta-workflows that automate the creation process. Both run in the same Bodhi engine they generate workflows for.
        </p>

        <div className={styles.builderTabs}>
          {builders.map((b, i) => (
            <button
              key={b.id}
              className={`${styles.builderTab} ${i === activeBuilder ? styles.builderTabActive : ''}`}
              style={i === activeBuilder ? { borderColor: b.color, color: b.color } : undefined}
              onClick={() => setActiveBuilder(i)}
            >
              {b.label}
            </button>
          ))}
        </div>

        <div className={styles.content} key={`builder-${activeBuilder}`}>
          <section className={styles.hero}>
            <span className={styles.badge} style={{ borderColor: builder.color, color: builder.color }}>
              {builder.badge}
            </span>
            <h3 className={styles.heroTitle}>{builder.title}</h3>
            <p className={styles.heroDesc}>{builder.description}</p>
            <div className={styles.statsRow}>
              {builder.stats.map((s) => (
                <div key={s.label} className={styles.stat}>
                  <div className={styles.statValue} style={{ color: builder.color }}>{s.value}</div>
                  <div className={styles.statLabel}>{s.label}</div>
                </div>
              ))}
            </div>
          </section>

          <WorkflowCard title="Pipeline">
            <div className={styles.workflow}>
              {builder.pipelineSteps.map((step, i) => (
                <div key={i}>
                  <div className={styles.node}>
                    <div
                      className={styles.nodeNumber}
                      data-type={step.type}
                      style={{ borderColor: builder.color, color: builder.color }}
                    >
                      {i + 1}
                    </div>
                    <div className={styles.nodeBody}>
                      <div className={styles.nodeLabel}>{step.label}</div>
                      <div className={styles.nodeDesc}>{step.description}</div>
                    </div>
                  </div>
                  {i < builder.pipelineSteps.length - 1 && (
                    <div className={styles.connector} style={{ background: builder.color }} />
                  )}
                </div>
              ))}
            </div>
          </WorkflowCard>

          <WorkflowCard title="Example">
            <div className={styles.exampleBlock}>
              <div className={styles.exampleRow}>
                <span className={styles.exampleLabel}>Input</span>
                <span className={styles.exampleValue}>{builder.inputExample}</span>
              </div>
              <div className={styles.exampleArrow} style={{ color: builder.color }}>↓</div>
              <div className={styles.exampleRow}>
                <span className={styles.exampleLabel}>Output</span>
                <span className={styles.exampleValue}>{builder.outputExample}</span>
              </div>
            </div>
          </WorkflowCard>

          <WorkflowCard title="Key Features">
            {builder.features.map((f) => (
              <div key={f.title} className={styles.featureItem}>
                <div className={styles.featureTitle}>{f.title}</div>
                <div className={styles.featureDesc}>{f.description}</div>
              </div>
            ))}
          </WorkflowCard>
        </div>
      </section>

      {/* ── Workflows Section ── */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Production Workflows</h2>
        <p className={styles.sectionDesc}>
          Three workflows built using the design-to-JSON pipeline above.
          Each was generated from a markdown design doc and runs on the Bodhi MCP engine with {tabs.reduce((sum, t) => sum + t.tools.length, 0)} tools across {tabs.reduce((sum, t) => sum + t.workflowNodes.length, 0)} nodes.
        </p>

        <TabBar
          tabs={tabs.map((t) => ({ label: t.label, color: t.color }))}
          active={activeTab}
          onChange={setActiveTab}
        />

        <div className={styles.content} key={`workflow-${activeTab}`}>
          <section className={styles.hero}>
            <span className={styles.badge} style={{ borderColor: accent, color: accent }}>
              {tab.badge}
            </span>
            <h3 className={styles.heroTitle}>{tab.title}</h3>
            <p className={styles.heroDesc}>{tab.description}</p>
            <div className={styles.statsRow}>
              {tab.stats.map((s) => (
                <div key={s.label} className={styles.stat}>
                  <div className={styles.statValue} style={{ color: accent }}>{s.value}</div>
                  <div className={styles.statLabel}>{s.label}</div>
                </div>
              ))}
            </div>
          </section>

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

          <WorkflowCard title="MCP Tools" variant="grid">
            {tab.tools.map((tool) => (
              <div key={tool.name} className={styles.toolCard}>
                <div className={styles.toolName} style={{ color: accent }}>{tool.name}</div>
                <div className={styles.toolDesc}>{tool.description}</div>
              </div>
            ))}
          </WorkflowCard>

          <WorkflowCard title="Key Features">
            {tab.features.map((f) => (
              <div key={f.title} className={styles.featureItem}>
                <div className={styles.featureTitle}>{f.title}</div>
                <div className={styles.featureDesc}>{f.description}</div>
              </div>
            ))}
          </WorkflowCard>
        </div>
      </section>
    </div>
  );
}

/* ── Helper Components ── */

function PipelineStep({
  number,
  label,
  description,
  color,
  link,
}: {
  number: string;
  label: string;
  description: string;
  color: string;
  link?: string;
}) {
  return (
    <div className={styles.pipelineStep}>
      <div className={styles.pipelineNumber} style={{ borderColor: color, color }}>{number}</div>
      <div className={styles.pipelineLabel}>{label}</div>
      <div className={styles.pipelineDesc}>{description}</div>
      {link && <div className={styles.pipelineLink} style={{ color }}>via {link}</div>}
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
