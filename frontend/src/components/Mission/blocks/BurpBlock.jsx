// src/components/Mission/blocks/BurpBlock.jsx — Professional Burp Suite with Request/Response tabs & search filter
import BurpSuitePro from './BurpSuitePro';

export default function BurpBlock({ requests = [], mission, onCaptureIndicator }) {
  return (
    <BurpSuitePro
      requests={requests}
      mission={mission}
      onCaptureIndicator={onCaptureIndicator}
    />
  );
}
