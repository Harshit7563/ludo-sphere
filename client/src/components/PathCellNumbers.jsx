import { useMemo } from 'react';
import {
  getPathDebugMarkers,
  getPathDebugLegend,
  pathDebugAliasList,
} from '../game/pathDebugMarkers';
import { getWalkStepFromMarker } from '../game/colorPathWalk';
import { getColorPath } from '../game/colorPaths';

export default function PathCellNumbers({
  compactLegend = false,
  pathColor = 'blue',
  interactive = false,
  activeWalkStep = null,
  onWalkTap,
  walkAnimating = false,
}) {
  const path = getColorPath(pathColor);
  const markers = useMemo(() => getPathDebugMarkers(pathColor), [pathColor]);
  const legend = useMemo(() => getPathDebugLegend(pathColor), [pathColor]);
  const maxVisible = path?.ringSteps ?? 0;

  return (
    <>
      <div
        className={`path-cell-numbers${interactive ? ' path-cell-numbers--interactive' : ''}`}
        aria-hidden={!interactive}
      >
        {markers.map((m) => {
          const aliases = pathDebugAliasList(m.alias);
          const aliasText = aliases.length ? aliases.join('/') : null;
          const walkStep = interactive
            ? getWalkStepFromMarker(m, aliases, pathColor)
            : null;
          const isTappable = walkStep != null;
          const isActive = isTappable && activeWalkStep === walkStep;
          const hideRingNum = path?.calibrated
            && m.kind === 'ring'
            && Number(m.label) > maxVisible;
          if (hideRingNum) return null;

          const Tag = interactive && isTappable ? 'button' : 'span';

          return (
            <div
              key={m.id}
              className="path-cell-slot"
              style={{ gridRow: m.row + 1, gridColumn: m.col + 1 }}
            >
            <Tag
              type={interactive && isTappable ? 'button' : undefined}
              className={[
                'path-cell-num',
                `path-cell-num--${m.kind}`,
                m.color ? `path-cell-num--${m.color}` : '',
                aliases.length ? 'path-cell-num--tagged' : '',
                isTappable ? 'path-cell-num--tappable' : '',
                isActive ? 'path-cell-num--active' : '',
                m.label === '★' ? 'path-cell-num--star' : '',
                !path?.calibrated && m.kind === 'extended' ? 'path-cell-num--pending' : '',
              ].filter(Boolean).join(' ')}
              title={
                m.title
                ?? (walkStep != null
                  ? `${pathColor} walk step ${walkStep}`
                  : m.aliasOnly && aliasText
                    ? aliasText
                    : aliasText
                      ? `${m.label}/${aliasText}`
                      : m.kind === 'ring' ? `Ring cell ${m.label}` : m.label)
              }
              disabled={interactive && isTappable ? walkAnimating : undefined}
              onClick={isTappable ? () => onWalkTap?.(walkStep) : undefined}
            >
              <span className="path-cell-num-inner">
                {m.aliasOnly && aliases.length ? (
                  aliases.map((tag) => (
                    <span key={tag} className={`path-cell-num-alias path-cell-num-alias--${pathColor}`}>{tag}</span>
                  ))
                ) : aliases.length ? (
                  <>
                    <span className="path-cell-num-label">{m.label}</span>
                    {aliases.map((tag) => (
                      <span key={tag} className="path-cell-num-tag">
                        <span className="path-cell-num-sep">/</span>
                        <span className={`path-cell-num-alias path-cell-num-alias--${pathColor}`}>{tag}</span>
                      </span>
                    ))}
                  </>
                ) : (
                  <span className="path-cell-num-label">{m.label}</span>
                )}
              </span>
            </Tag>
            </div>
          );
        })}
      </div>
      {!compactLegend && (
        <div className="path-cell-legend" role="note">
          <strong>{pathColor} path</strong>
          <ul>
            {legend.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}
