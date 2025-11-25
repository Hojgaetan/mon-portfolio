import { Github, Linkedin, Instagram, Facebook, User, FileDown } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export const Footer = () => {
	const currentYear = new Date().getFullYear();
	const { t } = useLanguage();

	return (
		<footer className="border-t border-[#3A5818] bg-background p-4">
			<div className="mx-auto max-w-7xl px-2 sm:px-4">
				<div className="flex flex-col items-center justify-between gap-4 text-center md:flex-row md:gap-6 md:text-left">
					{/* Section principale avec liens sociaux et CV */}
					<div className="flex flex-col items-center gap-4 w-full md:w-auto md:flex-row md:gap-6">
						{/* Liens sociaux */}
						<div className="flex flex-col items-center gap-3 pb-4 border-b border-[#262833] md:flex-row md:gap-2 md:border-b-0 md:border-r md:pb-0 md:pr-6">
							<span className="text-sm whitespace-nowrap">{t('footer.social_links')}:</span>
							<div className="flex items-center gap-3">
                                <a href="https://www.linkedin.com/in/joel-gaetan-hassam-obah/" target="_blank" rel="noopener noreferrer" className="p-2 bg-card/60 backdrop-blur-sm rounded border border-border hover:bg-accent hover:text-accent-foreground transition-colors">
                                    <Linkedin className="w-4 h-4 sm:w-5 sm:h-5" />
                                </a>
                                <a href="https://github.com/Hojgaetan" target="_blank" rel="noopener noreferrer" className="p-2 bg-card/60 backdrop-blur-sm rounded border border-border hover:bg-accent hover:text-accent-foreground transition-colors">
                                    <Github className="w-4 h-4 sm:w-5 sm:h-5" />
                                </a>
                                <a href="https://www.instagram.com/joel_hassam/" target="_blank" rel="noopener noreferrer" className="p-2 bg-card/60 backdrop-blur-sm rounded border border-border hover:bg-accent hover:text-accent-foreground transition-colors">
                                    <Instagram className="w-4 h-4 sm:w-5 sm:h-5" />
                                </a>
                                <a href="https://www.facebook.com/joelgaetanhassamobah" target="_blank" rel="noopener noreferrer" className="p-2 bg-card/60 backdrop-blur-sm rounded border border-border hover:bg-accent hover:text-accent-foreground transition-colors">
                                    <Facebook className="w-4 h-4 sm:w-5 sm:h-5" />
                                </a>
							</div>
						</div>

						{/* Bouton CV */}
						<div className="pb-4 border-b border-border/50 md:border-b-0 md:border-r md:pb-0 md:pr-6">
							<a
								href="/CV__Joel Gaetan_HASSAM OBAH.pdf"
								download
								className="flex items-center space-x-2 rounded-md bg-accent-red px-3 py-2 text-white hover:bg-accent-red/90 shadow-md shadow-accent-red/20 transition-all text-sm"
							>
								<FileDown className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
								<span className="whitespace-nowrap">{t('footer.download_cv')}</span>
							</a>
						</div>

						{/* Copyright */}
						<div className="pb-4 md:pb-0">
							<p className="text-sm">&copy;_{currentYear} Hojgaetan_{t('footer.rights_reserved')}.</p>
						</div>
					</div>

					{/* Signature + version */}
					<div className="flex items-center gap-3 pt-4 border-t border-border/50 md:border-t-0 md:border-l md:pl-6 md:pt-0">
						<User className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 text-accent-blue" />
						<span className="text-sm">@Hojgaetan</span>
						<span className="text-xs text-muted-foreground" aria-label="version">
							v{__APP_VERSION__}
						</span>
					</div>
				</div>
			</div>
		</footer>
	);
};
