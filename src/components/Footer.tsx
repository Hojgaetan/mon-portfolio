import { Github, Linkedin, User } from "lucide-react";
import { PdfIcon } from "./PdfIcon";

export const Footer = () => {
	const currentYear = new Date().getFullYear();

	return (
		<footer className="border-t border-[#3A5818] bg-background p-4">
			<div className="container mx-auto">
				<div className="flex flex-col items-center justify-between gap-6 text-center md:flex-row md:gap-0 md:text-left">
					<div className="flex flex-col items-center gap-6 md:flex-row md:gap-4">
						<div className="flex flex-col items-center gap-4 border-b border-[#262833] pb-6 md:flex-row md:border-b-0 md:border-r md:pb-0 md:pr-4">
							<span>Suivez moi sur</span>
							<div className="flex items-center gap-4">
								<a
									href="https://linkedin.com/in/joel-gaetan-hassam-obah"
									target="_blank"
									rel="noopener noreferrer"
								>
									<Linkedin className="h-6 w-6" />
								</a>
								<a
									href="https://github.com/Hojgaetan"
									target="_blank"
									rel="noopener noreferrer"
								>
									<Github className="h-6 w-6" />
								</a>
							</div>
						</div>

						<div className="flex flex-col items-center gap-6 border-b border-[#262833] pb-6 md:flex-row md:gap-4 md:border-b-0 md:border-r md:pb-0 md:pr-4">
							<a
								href="/path-to-your-cv.pdf"
								download
								className="flex items-center space-x-2 rounded-md bg-accent-red px-4 py-2 text-primary-foreground hover:bg-accent-red/90"
							>
								<PdfIcon className="h-6 w-6" />
								<span>Télécharger mon CV</span>
							</a>
						</div>

						<div className="pb-6 md:pb-0">
							<p>&copy; {currentYear} Hojgaetan. Tous droits réservés.</p>
						</div>
					</div>

					<div className="flex items-center space-x-2 pt-6 md:border-l md:border-[#262833] md:pl-4 md:pt-0">
						<User className="h-6 w-6" />
						<span>@Hojgaetan</span>
					</div>
				</div>
			</div>
		</footer>
	);
};
