interface PendingInfoBoxProps {
  referenceId: string;
  urlDetails?: string;
}

const PendingInfoBox = ({ referenceId, urlDetails }: PendingInfoBoxProps) => (
  <div
    className="border rounded-xl"
    style={{
      backgroundColor: '#FFF3D9', // infoOrange.light
      borderColor: '#FFB612', // infoOrange.dark
      padding: '16px',
    }}
  >
    <p
      className="mb-[10px]"
      style={{
        fontFamily: 'Lota Grotesque',
        fontSize: '14px',
        fontWeight: 600,
        color: '#57537A', // neutralDark.main
      }}
    >
      Información para realizar el pago:
    </p>
    <p
      className="mb-1"
      style={{
        fontFamily: 'Lota Grotesque',
        fontSize: '14px',
        fontWeight: 400,
        color: '#57537A', // neutralDark.main
      }}
    >
      Código de referencia:
    </p>
    <p
      className="mb-1"
      style={{
        fontFamily: 'Lota Grotesque',
        fontSize: '14px',
        fontWeight: 400,
        color: '#57537A', // neutralDark.main
      }}
    >
      {referenceId || 'xxxxxxxx'}
    </p>
    {urlDetails && (
      <a
        href={urlDetails}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block px-4 py-2 rounded-xl text-white no-underline hover:opacity-90 transition-opacity"
        style={{
          backgroundColor: '#FFB612', // infoOrange.main
          fontFamily: 'Lota Grotesque',
          fontSize: '14px',
          fontWeight: 600,
          textTransform: 'none',
          boxShadow: 'none',
        }}
      >
        VER MÁS DETALLES
      </a>
    )}
  </div>
);

export default PendingInfoBox;
