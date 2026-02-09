import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api';

function ChallengeDetail() {
  const { id } = useParams();
  const [challenge, setChallenge] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get(`/api/challenges/${id}`)
      .then(res => {
        setChallenge(res.data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div className="container"><p>Loading...</p></div>;
  if (error) return <div className="container"><p>Error: {error}</p></div>;
  if (!challenge) return <div className="container"><p>Challenge not found</p></div>;

  return (
    <div className="container">
      <Link to="/challenges" className="back-link">← Back to Challenges</Link>

      <div className="challenge-detail">
        <h1>{challenge.title}</h1>
        <div className="category">{challenge.category}</div>

        <div className="description">
          <h2>Challenge Brief</h2>
          {challenge.description}
        </div>

        <div className="requirements">
          <h3>Required Deliverables</h3>
          <ul>
            {challenge.requirements.map((req, idx) => (
              <li key={idx}>{req}</li>
            ))}
          </ul>
        </div>

        <div className="solution">
          <h2>Our Solution</h2>
          <div className="solution-content">
            {renderSolution(challenge.solution)}
          </div>

          {renderDemoLink(challenge)}
        </div>
      </div>
    </div>
  );
}

function renderDemoLink(challenge) {
  const demoRoute = challenge?.solution?.data?.demoRoute || challenge?.solution?.data?.landingPage?.demoRoute;
  if (!demoRoute) return null;

  return (
    <div className="demo-cta">
      <h3>Live Demo</h3>
      <p>Try the logged-out prototype used in this solution.</p>
      <Link to={demoRoute} className="demo-link">
        Open Demo →
      </Link>
    </div>
  );
}

function renderSolution(solution) {
  const data = solution.data;

  switch (solution.type) {
    case 'spend-plan':
      return (
        <div>
          <h3>Market: {data.market}</h3>
          <p><strong>Budget:</strong> ${data.budget.toLocaleString()} over {data.timeline} days</p>
          
          <h4>Channel Allocation</h4>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Channel</th>
                  <th>Allocation</th>
                  <th>Purpose</th>
                  <th>Timeline</th>
                </tr>
              </thead>
              <tbody>
                {data.channels.map((ch, idx) => (
                  <tr key={idx}>
                    <td><strong>{ch.name}</strong></td>
                    <td>${ch.allocation.toLocaleString()} ({ch.percentage}%)</td>
                    <td>{ch.purpose}</td>
                    <td>{ch.sequencing}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h4>Marketing Funnel</h4>
          <div className="data-section">
            <p><strong>Impression:</strong> {data.funnel.impression}</p>
            <p><strong>Consideration:</strong> {data.funnel.consideration}</p>
            <p><strong>Conversion:</strong> {data.funnel.conversion}</p>
          </div>

          <h4>Leading Indicators to Track</h4>
          <ul>
            {data.leadingIndicators.map((ind, idx) => (
              <li key={idx}>{ind}</li>
            ))}
          </ul>

          {data.ads && (
            <>
              <h4>Required Ads</h4>
              <div className="data-section">
                <h5>Awareness Ad</h5>
                <p><strong>Platform:</strong> {data.ads.awareness.platform}</p>
                <p><strong>Headline:</strong> {data.ads.awareness.headline}</p>
                <p><strong>Primary Text:</strong> {data.ads.awareness.primaryText}</p>
                <p><strong>Creative Direction:</strong> {data.ads.awareness.creativeDirection}</p>
                <p><strong>CTA:</strong> {data.ads.awareness.cta}</p>
              </div>
              <div className="data-section">
                <h5>Mid-Funnel Retargeting Ad</h5>
                <p><strong>Platform:</strong> {data.ads.retargeting.platform}</p>
                <p><strong>Headline:</strong> {data.ads.retargeting.headline}</p>
                <p><strong>Primary Text:</strong> {data.ads.retargeting.primaryText}</p>
                <p><strong>Creative Direction:</strong> {data.ads.retargeting.creativeDirection}</p>
                <p><strong>CTA:</strong> {data.ads.retargeting.cta}</p>
              </div>
            </>
          )}

          {data.landingPage && (
            <>
              <h4>Landing Page / Logged-Out Experience</h4>
              <p><strong>{data.landingPage.name}:</strong> {data.landingPage.valueProp}</p>
              <ul>
                {data.landingPage.sections.map((s, idx) => (
                  <li key={idx}>{s}</li>
                ))}
              </ul>
            </>
          )}
        </div>
      );

    case 'creative-pipeline':
      return (
        <div>
          <h4>Creative Pipeline Stages</h4>
          <ol>
            {data.pipelineStages.map((stage, idx) => (
              <li key={idx}>
                <strong>{stage.stage}</strong> - {stage.description}
              </li>
            ))}
          </ol>

          <h4>Creative Concepts</h4>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Title</th>
                  <th>Description</th>
                  <th>Copy</th>
                  <th>Platform</th>
                </tr>
              </thead>
              <tbody>
                {data.creatives.map((creative, idx) => (
                  <tr key={idx}>
                    <td>{creative.type}</td>
                    <td><strong>{creative.title}</strong></td>
                    <td>{creative.description}</td>
                    <td><em>"{creative.copy}"</em></td>
                    <td>{creative.platform}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h4>Governance: AI vs. Human</h4>
          <div className="data-section">
            <p><strong>AI Generates:</strong> {data.governance.aiGenerates.join(', ')}</p>
            <p><strong>Human Decides:</strong> {data.governance.humanDecides.join(', ')}</p>
            <p><strong>Frequency:</strong> {data.governance.frequencyPerWeek}</p>
          </div>
        </div>
      );

    case 'organic-asset':
      return (
        <div>
          <h3>Asset: {data.asset}</h3>
          <p><strong>Premise:</strong> {data.premise}</p>

          <h4>Discovery Path</h4>
          {data.discoveryPath.map((path, idx) => (
            <div key={idx} className="data-section">
              <h5>{path.channel}</h5>
              {path.keyword && <p><strong>Keywords:</strong> {path.keyword}</p>}
              {path.estimatedMonthlySearches && <p><strong>Est. Monthly Searches:</strong> {path.estimatedMonthlySearches.toLocaleString()}</p>}
              {path.platforms && <p><strong>Platforms:</strong> {path.platforms}</p>}
              <p><strong>Strategy:</strong> {path.strategy}</p>
            </div>
          ))}

          <h4>Asset Description</h4>
          <p>{data.asset_description}</p>

          <h4>Conversion Mechanism</h4>
          <ol>
            <li><strong>Step 1:</strong> {data.conversionMechanism.step1}</li>
            <li><strong>Step 2:</strong> {data.conversionMechanism.step2}</li>
            <li><strong>Step 3:</strong> {data.conversionMechanism.step3}</li>
            <li><strong>Step 4:</strong> {data.conversionMechanism.step4}</li>
          </ol>

          <h4>12-Month Growth Model</h4>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Timeline</th>
                  <th>Visits</th>
                  <th>Signups</th>
                  <th>Assumption</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(data.growthModel).map(([month, stats]) => (
                  <tr key={month}>
                    <td><strong>{month.charAt(0).toUpperCase() + month.slice(1)}</strong></td>
                    <td>{stats.visits.toLocaleString()}</td>
                    <td>{stats.signups.toLocaleString()}</td>
                    <td>{stats.assumption}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );

    case 'web-tool':
      return (
        <div>
          <h3>Tool: {data.tool}</h3>
          <p><strong>Adjacent Problem:</strong> {data.adjacentProblem}</p>
          <p><strong>Tool Function:</strong> {data.toolFunction}</p>

          <h4>Discovery Mechanism</h4>
          <ul>
            <li><strong>Search:</strong> {data.discoveryMechanism.search}</li>
            <li><strong>Social:</strong> {data.discoveryMechanism.social}</li>
          </ul>

          <h4>Conversion Path</h4>
          <ol>
            {data.conversionPath.map((step, idx) => (
              <li key={idx}>{step}</li>
            ))}
          </ol>

          <h4>Expected Impact</h4>
          <ul>
            <li><strong>Monthly Traffic:</strong> {data.expectedTraffic}</li>
            <li><strong>Conversion Rate:</strong> {data.conversionRate}</li>
            <li><strong>Compounding Effect:</strong> {data.compoundingEffect}</li>
          </ul>
        </div>
      );

    case 'lifecycle-system':
      return (
        <div>
          <h4>Focus Metrics</h4>
          <ul>
            {data.focusMetrics.map((m, idx) => (
              <li key={idx}>{m}</li>
            ))}
          </ul>

          <h4>Segments + Triggers</h4>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Segment</th>
                  <th>Criteria</th>
                  <th>Trigger</th>
                  <th>Channel</th>
                  <th>Message</th>
                </tr>
              </thead>
              <tbody>
                {data.segments.map((s, idx) => (
                  <tr key={idx}>
                    <td><strong>{s.name}</strong></td>
                    <td>{s.criteria}</td>
                    <td>{s.trigger}</td>
                    <td>{s.channel}</td>
                    <td>{s.message}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h4>Conversion Flow (Behavioral)</h4>
          <ol>
            {Object.values(data.conversionFlow).map((step, idx) => (
              <li key={idx}>{step}</li>
            ))}
          </ol>

          <h4>Measurement Framework</h4>
          <p><strong>Leading:</strong> {data.measurement.leadingIndicators.join(', ')}</p>
          <p><strong>Lagging:</strong> {data.measurement.laggingIndicators.join(', ')}</p>
          <p><strong>Cohorts:</strong> {data.measurement.cohortTracking}</p>
        </div>
      );

    case 'ai-tool':
      return (
        <div>
          <p><strong>Target Function:</strong> {data.targetFunction}</p>
          <p><strong>Problem:</strong> {data.problem}</p>
          <p><strong>Solution:</strong> {data.solution}</p>

          <h4>Before / After</h4>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Metric</th>
                  <th>Before</th>
                  <th>After</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Time to Test Hypothesis</td>
                  <td>{data.beforeAfter.before.timeToTestHypothesis}</td>
                  <td>{data.beforeAfter.after.timeToTestHypothesis}</td>
                </tr>
                <tr>
                  <td>Copy Variations per Test</td>
                  <td>{data.beforeAfter.before.copyVariations}</td>
                  <td>{data.beforeAfter.after.copyVariations}</td>
                </tr>
                <tr>
                  <td>Insight Discovery</td>
                  <td>{data.beforeAfter.before.insightDiscovery}</td>
                  <td>{data.beforeAfter.after.insightDiscovery}</td>
                </tr>
                <tr>
                  <td><strong>Bottleneck</strong></td>
                  <td>{data.beforeAfter.before.bottleneck}</td>
                  <td>{data.beforeAfter.after.improvement}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h4>AI Agent Workflow</h4>
          <ol>
            {data.workflow.map((step, idx) => (
              <li key={idx}>{step}</li>
            ))}
          </ol>
        </div>
      );

    case 'brand-strategy':
      return (
        <div>
          <p><strong>Country:</strong> {data.country}</p>
          <p><strong>Passion Space:</strong> {data.passionSpace}</p>
          <p><strong>Rationale:</strong> {data.rationale}</p>

          <h4>Sponsorship Ideas</h4>
          {data.sponsorships.map((sponsorship, idx) => (
            <div key={idx} className="data-section">
              <h5>{sponsorship.name}</h5>
              <p><strong>Concept:</strong> {sponsorship.concept}</p>
              <p><strong>Activation:</strong> {sponsorship.activation}</p>
              <p><strong>Reach:</strong> {sponsorship.reach}</p>
            </div>
          ))}
        </div>
      );

    case 'product-system':
      if (data.mechanics) {
        return (
          <div>
            <p><strong>Problem:</strong> {data.problem}</p>
            <p><strong>Solution:</strong> {data.solution}</p>

            <h4>Core Mechanics</h4>
            {data.mechanics.map((mech, idx) => (
              <div key={idx} className="data-section">
                <h5>{mech.mechanism}</h5>
                <p><strong>Logic:</strong> {mech.logic}</p>
                <p><strong>Incentive:</strong> {mech.incentive}</p>
              </div>
            ))}

            <h4>Prototype Path</h4>
            <ol>
              {data.prototypePath.map((step, idx) => (
                <li key={idx}>{step}</li>
              ))}
            </ol>

            <h4>Scaling Plan</h4>
            <ul>
              {Object.entries(data.scalingPlan).map(([phase, description]) => (
                <li key={phase}><strong>{phase}:</strong> {description}</li>
              ))}
            </ul>
          </div>
        );
      }

      // Intelligent Voicemail system uses the same "product-system" wrapper but different keys.
      return (
        <div>
          <p><strong>Current Problem:</strong> {data.currentProblem}</p>
          <p><strong>New System:</strong> {data.newSystem}</p>

          <h4>Pipeline</h4>
          <ol>
            {data.pipeline.map((p, idx) => (
              <li key={idx}>
                <strong>{p.step}</strong>
                {p.action && <> — {p.action}</>}
                {p.classifies && (
                  <ul>
                    {p.classifies.map((c, cidx) => (
                      <li key={cidx}>{c}</li>
                    ))}
                  </ul>
                )}
                {p.generates && <div><strong>Generates:</strong> {p.generates}</div>}
                {p.displays && <div><strong>Displays:</strong> {p.displays}</div>}
                {p.tracks && <div><strong>Tracks:</strong> {p.tracks}</div>}
              </li>
            ))}
          </ol>

          <h4>Expected Impact</h4>
          <ul>
            {Object.entries(data.impact).map(([k, v]) => (
              <li key={k}><strong>{k}:</strong> {v}</li>
            ))}
          </ul>
        </div>
      );

    case 'product-redesign':
      return (
        <div>
          <h4>Current State</h4>
          <ul>
            {Object.entries(data.currentState).map(([key, value]) => (
              <li key={key}><strong>{key}:</strong> {Array.isArray(value) ? value.join(', ') : value}</li>
            ))}
          </ul>

          <h4>New User Flow</h4>
          {data.newFlow.map((step, idx) => (
            <div key={idx} className="data-section">
              <h5>Step {idx + 1}: {step.step}</h5>
              <p><strong>Actor:</strong> {step.actor}</p>
              <p><strong>Action:</strong> {step.action}</p>
              {step.frictionReduction && <p><strong>Friction Reduction:</strong> {step.frictionReduction}</p>}
              {step.continuity && <p><strong>Impact:</strong> {step.continuity}</p>}
            </div>
          ))}

          <h4>Expected Impact</h4>
          <ul>
            {Object.entries(data.expectedImpact).map(([key, value]) => (
              <li key={key}><strong>{key}:</strong> {value}</li>
            ))}
          </ul>
        </div>
      );

    case 'product-architecture':
      return (
        <div>
          <p><strong>Architecture:</strong> {data.architecture}</p>

          <h4>Data Model</h4>
          <h5>Included in Summary</h5>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Field</th>
                  <th>Visible To</th>
                  <th>Format</th>
                </tr>
              </thead>
              <tbody>
                {data.dataModel.includedInSummary.map((field, idx) => (
                  <tr key={idx}>
                    <td><strong>{field.field}</strong></td>
                    <td>{field.visible_to}</td>
                    <td>{field.format}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h5>Excluded from Summary</h5>
          <ul>
            {data.dataModel.excludedFromSummary.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>

          <h4>Permission Model Examples</h4>
          <ul>
            {Object.entries(data.permissionModel).map(([role, access]) => (
              <li key={role}><strong>{role}:</strong> {access.join(', ')}</li>
            ))}
          </ul>

          <h4>Safety Mechanisms</h4>
          <ul>
            {data.safetyMechanisms.map((mech, idx) => (
              <li key={idx}>{mech}</li>
            ))}
          </ul>
        </div>
      );

    case 'product-flow':
      return (
        <div>
          <h4>Current State</h4>
          <p>{data.currentState}</p>
          <h4>Target State</h4>
          <p>{data.newState}</p>

          <h4>Onboarding Flow</h4>
          {data.onboardingFlow.map((step, idx) => (
            <div key={idx} className="data-section">
              <h5>Step {step.step}: {step.title}</h5>
              {step.questions && (
                <>
                  <p><strong>Questions:</strong></p>
                  <ul>
                    {step.questions.map((q, qidx) => (
                      <li key={qidx}>{q}</li>
                    ))}
                  </ul>
                </>
              )}
              {step.section && <p><strong>Section:</strong> {step.section}</p>}
              <p><strong>Output:</strong> {step.output}</p>
            </div>
          ))}

          <h4>Key Features</h4>
          <p><strong>Intelligent Defaults:</strong> {data.intelligentDefaults}</p>
          <p><strong>Expected Outcome:</strong> {data.expectedOutcome}</p>
        </div>
      );

    case 'brand-campaign':
      return (
        <div>
          <h3>Selected Insight: {data.selectedInsight}</h3>
          <p><strong>Rationale:</strong> {data.rationale}</p>

          <h4>Big Idea</h4>
          <p style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#2563eb' }}>
            {data.bigIdea}
          </p>
          <p>{data.bigIdeaExplanation}</p>

          <h4>Taglines</h4>
          <ul>
            {data.taglines.map((tagline, idx) => (
              <li key={idx} style={{ fontSize: '1.1rem', margin: '0.75rem 0' }}>
                <em>"{tagline}"</em>
              </li>
            ))}
          </ul>

          <h4>Campaign Manifesto</h4>
          <div style={{ background: '#fff8f0', padding: '1.5rem', borderRadius: '8px', lineHeight: '1.8' }}>
            {data.manifesto.split('\n\n').map((paragraph, idx) => (
              <p key={idx}>{paragraph}</p>
            ))}
          </div>
        </div>
      );

    case 'launch-plan':
      return (
        <div>
          <h4>Audience</h4>
          <p><strong>Primary:</strong> {data.audience}</p>
          <p><strong>Job to be Done:</strong> {data.jobToBeDone}</p>
          <p><strong>Current Frustration:</strong> {data.currentFrustration}</p>

          <h4>Positioning</h4>
          <p style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#2563eb' }}>
            {data.positioning}
          </p>

          <h4>Message Pillars</h4>
          <ul>
            {data.messagesPillars.map((pillar, idx) => (
              <li key={idx}>{pillar}</li>
            ))}
          </ul>

          <h4>Launch Assets</h4>
          {Object.entries(data.launchAssets).map(([key, asset]) => (
            <div key={key} className="data-section">
              <h5>{asset.type}</h5>
              {asset.subject && <p><strong>Subject:</strong> {asset.subject}</p>}
              {asset.headline && <p><strong>Headline:</strong> {asset.headline}</p>}
              <p><strong>Message:</strong> {asset.body}</p>
              <p><strong>CTA:</strong> {asset.cta}</p>
            </div>
          ))}

          <h4>Channel Plan & Timeline</h4>
          {Object.entries(data.channelPlan).map(([timeframe, channels]) => (
            <p key={timeframe}><strong>{timeframe}:</strong> {channels.join(', ')}</p>
          ))}

          <h4>Success Metrics</h4>
          <ul>
            {data.successMetrics.map((metric, idx) => (
              <li key={idx}>{metric}</li>
            ))}
          </ul>

          <h4>Risks & Mitigations</h4>
          {data.risks.map((risk, idx) => (
            <div key={idx} className="data-section">
              <p><strong>Risk:</strong> {risk.risk}</p>
              <p><strong>Mitigation:</strong> {risk.mitigation}</p>
            </div>
          ))}
        </div>
      );

    case 'strategy':
      return (
        <div>
          <h4>Core Challenges</h4>
          {data.coreChallenges.map((challenge, idx) => (
            <div key={idx} className="data-section">
              <h5>{challenge.challenge}</h5>
              <p><strong>Impact:</strong> {challenge.impact}</p>
            </div>
          ))}

          <h4>AI Strategy Applications</h4>
          {data.aiStrategy.map((app, idx) => (
            <div key={idx} className="data-section">
              <h5>{idx + 1}. {app.application}</h5>
              <p><strong>Input:</strong> {app.input}</p>
              <p><strong>Output:</strong> {app.output}</p>
              <p><strong>Impact:</strong> {app.impact}</p>
            </div>
          ))}

          <h4>Governance & Risk Management</h4>
          <p><strong>Key Risk:</strong> {data.governance.keyRisk}</p>
          <p><strong>Safeguards:</strong></p>
          <ul>
            {data.governance.safeguards.map((safeguard, idx) => (
              <li key={idx}>{safeguard}</li>
            ))}
          </ul>
        </div>
      );

    default:
      return <p>Solution data format not recognized</p>;
  }
}

export default ChallengeDetail;
