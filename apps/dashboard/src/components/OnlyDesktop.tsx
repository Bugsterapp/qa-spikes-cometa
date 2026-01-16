import Image from 'next/image';

function OnlyDesktop() {
  return (
    <div
      className="w-screen h-screen text-center bg-cover bg-no-repeat"
      style={{
        backgroundImage: 'url(/assets/background-only-desktop.svg)',
      }}
    >
      <div className="text-center h-[70vh] pt-[25vh]">
        <Image src="/assets/computer.svg" width={160} height={112} alt="computer" />
        <h2 className="text-[#091A7A] mt-4 text-lg font-medium">Por favor abre esta página</h2>
        <h2 className="text-[#091A7A] text-lg font-medium">desde tu laptop o PC.</h2>
        <br />
        <p className="text-[#57537A] text-base font-medium">Aún estamos trabajando en la versión</p>
        <p className="text-[#57537A] text-base font-medium">del Dashboard para celular.</p>
      </div>
      <div className="h-[30vh] pt-[10vh]">
        <p className="text-[#57537A] text-base font-medium">¡Gracias por entender!</p>
      </div>
    </div>
  );
}

export default OnlyDesktop;
