interface HeaderProps {
  onOpenMenu: () => void
}

export default function Header({ onOpenMenu }: HeaderProps) {
  return (
    <header className="lg:hidden bg-white border-b shadow-md p-4 flex justify-between items-center fixed top-0 left-0 right-0 z-50">
      <h1 className="text-lg font-bold">Co-Parents</h1>
      <button onClick={onOpenMenu} className="text-2xl">
        ☰
      </button>
    </header>
  )
}
