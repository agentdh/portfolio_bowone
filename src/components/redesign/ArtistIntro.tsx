import { ExternalLink } from "lucide-react";
import catalog from "@/data/portfolio.json";
import { ARTIST_PROFILE } from "@/data/portfolio";
import CopyTextButton from "./CopyTextButton";
import DiscordIcon from "./DiscordIcon";

const profile = catalog.profile as Partial<{
  name: string;
  role: string;
  bio: string;
  email: string;
  commissionLinkTitle: string;
  commissionLinkUrl: string;
}> | undefined;

function commissionUrl() {
  try {
    const url = new URL(profile?.commissionLinkUrl || "");
    if (url.protocol === "https:" && !url.username && !url.password) return url;
  } catch { /* Use the verified public contact address. */ }
  return new URL("https://discord.gg/QGsfqz9HPC");
}

export default function ArtistIntro() {
  const name = profile?.name?.trim() || ARTIST_PROFILE.brand;
  const role = profile?.role?.trim() || ARTIST_PROFILE.roles.join(" · ");
  const bio = profile?.bio?.trim() || ARTIST_PROFILE.bio;
  const email = profile?.email?.trim() || ARTIST_PROFILE.email;
  const url = commissionUrl();
  const configuredLabel = profile?.commissionLinkTitle?.trim() || "디스코드로 문의하기";
  const isDiscord = ["discord.gg", "discord.com", "www.discord.com"].includes(url.hostname);
  const commissionLabel = isDiscord && ["의뢰하기", "의뢰하러 가기"].includes(configuredLabel)
    ? "디스코드로 문의하기"
    : configuredLabel;

  return (
    <section className="artist-intro wrap" id="artist-intro" aria-labelledby="artist-intro-title" data-arrival="">
      <div className="artist-intro-inner">
        <h2 id="artist-intro-title">{name}</h2>
        <p className="artist-intro-role">{role}</p>
        <p className="artist-intro-bio">{bio}</p>
        <div className="artist-intro-actions">
          <a className="button button-accent" href={url.href} target="_blank" rel="noopener noreferrer">
            <span className="discord-cta-content"><DiscordIcon /><span data-edit-key="artist-intro.cta">{commissionLabel}</span></span> <ExternalLink size={16} aria-hidden="true" />
          </a>
          <CopyTextButton text={email} label={email} actionLabel="프로필 이메일 주소 복사" successLabel="이메일 복사됨" className="button button-outline" />
        </div>
        <nav className="artist-intro-socials" aria-label="보원의 SNS 및 작업 채널">
          {ARTIST_PROFILE.socials.map(({ name, url }) => (
            <a key={url} href={url} target="_blank" rel="noopener noreferrer">{name}</a>
          ))}
        </nav>
      </div>
    </section>
  );
}
