import Image from 'next/image';

function OnlyDesktopPage() {
  return (
    <div
      className="w-screen h-screen text-center bg-cover bg-no-repeat"
      style={{
        backgroundImage: 'url(/assets/background-only-desktop.svg)',
      }}
    >
      <div className="text-center h-[70vh] pt-[25vh]">
        <Image src="/assets/computer.svg" width={160} height={112} alt="computer" />
        <h5
          className="font-normal mt-2"
          style={{
            color: '#091A7A',
            fontSize: '1.5rem',
            lineHeight: '1.334',
            letterSpacing: '0em',
          }}
        >
          Por favor abre esta página
        </h5>
        <h5
          className="font-normal"
          style={{
            color: '#091A7A',
            fontSize: '1.5rem',
            lineHeight: '1.334',
            letterSpacing: '0em',
          }}
        >
          desde tu laptop o PC.
        </h5>
        <br />
        <p
          className="font-normal"
          style={{
            color: '#57537A',
            fontSize: '1rem',
            lineHeight: '1.75',
            letterSpacing: '0.00938em',
          }}
        >
          Aún estamos trabajando en la versión
        </p>
        <p
          className="font-normal"
          style={{
            color: '#57537A',
            fontSize: '1rem',
            lineHeight: '1.75',
            letterSpacing: '0.00938em',
          }}
        >
          del Dashboard para celular.
        </p>
      </div>
      <div className="h-[30vh] pt-[10vh]">
        <p
          className="font-normal"
          style={{
            color: '#57537A',
            fontSize: '1rem',
            lineHeight: '1.75',
            letterSpacing: '0.00938em',
          }}
        >
          ¡Gracias por entender!
        </p>
      </div>
    </div>
  );
}

export default OnlyDesktopPage;
