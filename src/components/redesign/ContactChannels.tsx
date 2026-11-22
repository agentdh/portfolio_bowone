import { ExternalLink } from "lucide-react";
import catalog from "@/data/portfolio.json";
import { ARTIST_PROFILE } from "@/data/portfolio";
import CopyTextButton from "./CopyTextButton";
import DiscordIcon from "./DiscordIcon";

/** Single source of contact buttons for Home and the top of Commissions. */
const profile = catalog.profile as Partial<{
  email: string;
  commissionLinkTitle: string;
  commissionLinkUrl: string;
}> | undefined;

interface ContactChannelsProps {
  showEmailHeading?: boolean;
  editableHomeLabel?: boolean;
}

export default function ContactChannels({ showEmailHeading = false, editableHomeLabel = false }: ContactChannelsProps) {
  const email = profile?.email?.trim() || ARTIST_PROFILE.email;
  const configuredLabel = profile?.commissionLinkTitle?.trim() || "디스코드로 문의하기";
  let commissionUrl = ARTIST_PROFILE.discordUrl;
  try {
    const url = new URL(profile?.commissionLinkUrl || "");
    if (url.protocol === "https:" && !url.username && !url.password) commissionUrl = url.href;
  } catch { /* Use the existing published Discord invitation. */ }

  const isDiscord = ["discord.gg", "discord.com", "www.discord.com"].includes(new URL(commissionUrl).hostname);
  const commissionLabel = isDiscord && ["의뢰하기", "의뢰하러 가기"].includes(configuredLabel)
    ? "디스코드로 문의하기"
    : configuredLabel;

  return (
    <div className="contact-channels">
      {showEmailHeading && <p className="contact-channels-email">E-mail : {email}</p>}
      <div className="artist-intro-actions">
        <a className="button button-accent" href={commissionUrl} target="_blank" rel="noopener noreferrer">
          <span className="discord-cta-content"><DiscordIcon /><span data-edit-key={editableHomeLabel ? "artist-intro.cta" : undefined}>{commissionLabel}</span></span>
          <ExternalLink size={16} aria-hidden="true" />
        </a>
        <CopyTextButton text={email} label={email} actionLabel="프로필 이메일 주소 복사" successLabel="이메일 복사됨" className="button button-outline" />
      </div>
      <nav className="artist-intro-socials" aria-label="보원의 SNS 및 작업 채널">
        {ARTIST_PROFILE.socials.map(({ name, url }) => (
          <a key={url} href={url} target="_blank" rel="noopener noreferrer">{name}</a>
        ))}
      </nav>
    </div>
  );
}
