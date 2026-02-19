export default function Footer() {
    return (
        <footer className="border-t border-gray-200/60 bg-white/60 backdrop-blur-sm">
            <div className="px-4 lg:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-gray-500">
                <p>
                    © {new Date().getFullYear()}{' '}
                    <span className="font-semibold bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent">
                        Gainn.ai
                    </span>{' '}
                    — Intelligent Agricultural Insights
                </p>
                <div className="flex items-center gap-4">
                    <a href="#" className="hover:text-primary-600 transition-colors">Privacy</a>
                    <a href="#" className="hover:text-primary-600 transition-colors">Terms</a>
                    <a href="#" className="hover:text-primary-600 transition-colors">Support</a>
                </div>
            </div>
        </footer>
    )
}
