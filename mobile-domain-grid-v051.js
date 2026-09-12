const style = document.createElement('style');
style.id = 'mobileDomainGridV051';
style.textContent = `
  @media (max-width: 720px) {
    .domain-grid {
      display: grid !important;
      grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
      gap: 9px !important;
      overflow: visible !important;
      padding: 0 !important;
      margin-right: 0 !important;
      scroll-snap-type: none !important;
    }
    .domain-choice {
      min-width: 0 !important;
      width: 100% !important;
      min-height: 92px !important;
      grid-template-columns: auto 1fr !important;
      gap: 9px !important;
      padding: 12px !important;
      scroll-snap-align: none !important;
    }
    .domain-choice-icon {
      width: 36px !important;
      height: 36px !important;
      border-radius: 11px !important;
      font-size: 20px !important;
    }
    .domain-choice-copy strong {
      font-size: 13px !important;
      line-height: 1.25 !important;
    }
    .domain-choice-copy small {
      font-size: 10px !important;
      line-height: 1.35 !important;
    }
    .domain-choice-state {
      display: none !important;
    }
  }
`;
document.head.append(style);
