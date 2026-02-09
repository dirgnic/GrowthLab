import React, { useEffect, useMemo, useState } from 'react';
import { api } from '../../api';

function svgToDataUri(svg) {
  const encoded = encodeURIComponent(svg).replace(/'/g, '%27').replace(/"/g, '%22');
  return `data:image/svg+xml;charset=utf-8,${encoded}`;
}

function MediaStudio() {
  const [creatives, setCreatives] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [mock, setMock] = useState(null);
  const [aiImage, setAiImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [aiStatus, setAiStatus] = useState(null);
  const [useAIImage, setUseAIImage] = useState(false);
  const [imageModel, setImageModel] = useState('black-forest-labs/flux.2-flex');

  async function load() {
    const res = await api.get('/api/artifacts', { params: { task_id: 'paid-media-b', type: 'creative', limit: 200 } });
    const items = Array.isArray(res.data) ? res.data : [];
    setCreatives(items);
    setSelectedId(items[0]?.id || '');
  }

  useEffect(() => {
    load().catch(() => {});
    api.get('/api/ai/status').then(r => {
      setAiStatus(r.data);
      if (Array.isArray(r.data.recommendedImageModels) && r.data.recommendedImageModels.length) {
        setImageModel(r.data.recommendedImageModels[0]);
      }
    }).catch(() => {});
  }, []);

  const selected = useMemo(() => creatives.find(c => c.id === selectedId), [creatives, selectedId]);
  const creative = selected?.contentJson || null;

  async function generateMock() {
    if (!creative) return;
    setLoading(true);
    setMessage(null);
    try {
      const res = await api.post('/api/tools/media/mock', {
        headline: creative.headline,
        primaryText: creative.primaryText,
        cta: creative.cta,
        funnelStage: creative.funnelStage,
        market: creative.market,
      });
      setMock(res.data);
      setAiImage(null);
      api.post('/api/events', { taskId: 'paid-media-b', name: 'generated_media_mock', props: { creativeArtifactId: selectedId } }).catch(() => {});
    } finally {
      setLoading(false);
    }
  }

  async function generateAI() {
    if (!creative) return;
    setLoading(true);
    setMessage(null);
    try {
      const modalities = imageModel.includes('gemini') ? ['image', 'text'] : ['image'];
      const res = await api.post('/api/ai/media/generate', {
        model: imageModel,
        inputs: { creative, modalities },
      });
      setAiImage(res.data);
      setMock(null);
      api.post('/api/events', { taskId: 'paid-media-b', name: 'generated_media_ai', props: { creativeArtifactId: selectedId, model: imageModel } }).catch(() => {});
    } catch (e) {
      setMessage(e?.response?.data?.error || e?.message || 'AI image request failed');
    } finally {
      setLoading(false);
    }
  }

  async function attachAsArtifact() {
    if (!mock || !creative || !selectedId) return;
    setLoading(true);
    setMessage(null);
    try {
      const media = {
        creativeArtifactId: selectedId,
        format: mock.format,
        width: mock.width,
        height: mock.height,
        svg: mock.svg,
        dataUri: svgToDataUri(mock.svg),
      };
      await api.post('/api/artifacts', {
        taskId: 'paid-media-b',
        type: 'media',
        status: 'draft',
        tags: {
          creativeArtifactId: selectedId,
          funnelStage: creative.funnelStage,
          market: creative.market,
          language: creative.language,
          tool: 'local-svg-mock',
        },
        contentJson: media,
      });
      setMessage('Saved media as an artifact (draft).');
      api.post('/api/events', { taskId: 'paid-media-b', name: 'saved_media_artifact', props: { creativeArtifactId: selectedId } }).catch(() => {});
    } finally {
      setLoading(false);
    }
  }

  async function attachAIAsArtifact() {
    if (!aiImage || !creative || !selectedId) return;
    const first = (aiImage.images || [])[0];
    if (!first) return;
    setLoading(true);
    setMessage(null);
    try {
      await api.post('/api/artifacts', {
        taskId: 'paid-media-b',
        type: 'media',
        status: 'draft',
        tags: {
          creativeArtifactId: selectedId,
          funnelStage: creative.funnelStage,
          market: creative.market,
          language: creative.language,
          tool: 'openrouter-image',
          model: aiImage.model,
        },
        contentJson: {
          creativeArtifactId: selectedId,
          format: 'image',
          model: aiImage.model,
          dataUri: first,
          prompt: aiImage.prompt,
        },
      });
      setMessage('Saved AI image as an artifact (draft).');
      api.post('/api/events', { taskId: 'paid-media-b', name: 'saved_media_ai_artifact', props: { creativeArtifactId: selectedId, model: aiImage.model } }).catch(() => {});
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container">
      <div className="tool-header">
        <h1>Media Studio (Image Step)</h1>
        <p>Demonstrates the “image tool” step in the creative pipeline by generating attachable SVG ad mocks.</p>
      </div>

      <div className="tool-grid">
        <div className="tool-card">
          <h2>Select a creative</h2>
          <label className="form-field">
            <span>Creative artifact</span>
            <select value={selectedId} onChange={e => setSelectedId(e.target.value)}>
              {creatives.map(c => (
                <option key={c.id} value={c.id}>
                  {c.status} · {c.contentJson?.funnelStage} · {String(c.contentJson?.language || '').toUpperCase()} · {c.contentJson?.headline?.slice(0, 42)}
                </option>
              ))}
            </select>
          </label>
          {!creative ? (
            <p className="muted">No creatives found. Generate and save some in `/tools/creative-generator` first.</p>
          ) : (
            <>
              <div className="data-section">
                <div className="creative-headline">{creative.headline}</div>
                <div className="muted" style={{ marginTop: '0.25rem' }}>
                  {creative.funnelStage} · {creative.persona} · {creative.market} · {String(creative.language).toUpperCase()}
                </div>
                <p style={{ marginTop: '0.75rem' }}>{creative.primaryText}</p>
              </div>
              <div className="data-section" style={{ marginTop: '1rem' }}>
                <h3>Media generator</h3>
                <label style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <input
                    type="checkbox"
                    checked={useAIImage}
                    onChange={e => setUseAIImage(e.target.checked)}
                    disabled={aiStatus && !aiStatus.aiConfigured}
                  />
                  Use OpenRouter image model
                </label>
                {useAIImage && (
                  <label className="form-field" style={{ marginTop: '0.75rem' }}>
                    <span>Image model</span>
                    <select value={imageModel} onChange={e => setImageModel(e.target.value)}>
                      {(aiStatus?.recommendedImageModels || []).map(m => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </label>
                )}
              </div>

              {!useAIImage ? (
                <>
                  <button className="primary-button" onClick={generateMock} disabled={loading}>
                    {loading ? 'Generating…' : 'Generate SVG mock'}
                  </button>
                  <button className="secondary-button" onClick={attachAsArtifact} disabled={loading || !mock} style={{ marginLeft: '0.75rem' }}>
                    Save media artifact
                  </button>
                </>
              ) : (
                <>
                  <button className="primary-button" onClick={generateAI} disabled={loading}>
                    {loading ? 'Generating…' : 'Generate AI image'}
                  </button>
                  <button className="secondary-button" onClick={attachAIAsArtifact} disabled={loading || !(aiImage?.images?.length)} style={{ marginLeft: '0.75rem' }}>
                    Save AI media artifact
                  </button>
                </>
              )}
              {message && <div className="success-text">{message}</div>}
            </>
          )}
          <div className="fine-print">
            For submission: this proves a working image step. You can later swap this generator with Runway/Sora output by saving a URL or upload.
          </div>
        </div>

        <div className="tool-card">
          <h2>Preview</h2>
          {!mock && !aiImage ? (
            <p className="muted">Generate a mock to preview it here.</p>
          ) : mock ? (
            <>
              <img src={svgToDataUri(mock.svg)} alt="ad mock" style={{ width: '100%', borderRadius: 12, border: '1px solid var(--border)' }} />
              <div className="fine-print">SVG is stored in the artifact as data (no external files needed).</div>
            </>
          ) : (
            <>
              <img src={(aiImage.images || [])[0]} alt="ai ad" style={{ width: '100%', borderRadius: 12, border: '1px solid var(--border)' }} />
              <div className="fine-print">Returned as a data URL from OpenRouter; saved to artifacts on demand.</div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default MediaStudio;
