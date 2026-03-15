export default function Footer() {
    const ano = new Date().getFullYear();
    
    return (
      <footer className="bg-white shadow-md mt-auto py-4">
        <div className="container mx-auto px-6">
          <div className="text-center text-sm text-gray-600">
            <p>© {ano} SIGA. Sistema Integrado de Gestão da Mobilidade.</p>
            <p className="mt-1">
              <small>
                Desenvolvido para Juazeiro do Norte - CE
              </small>
            </p>
          </div>
        </div>
      </footer>
    );
  }