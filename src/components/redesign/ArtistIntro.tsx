import catalog from "@/data/portfolio.json";
import { ARTIST_PROFILE } from "@/data/portfolio";
import ContactChannels from "./ContactChannels";

const profile = catalog.profile as Partial<{
  name: string;
  role: string;
  bio: string;
}> | undefined;

export default function ArtistIntro() {
  const name = profile?.name?.trim() || ARTIST_PROFILE.brand;
  const role = profile?.role?.trim() || ARTIST_PROFILE.roles.join(" · ");
  const bio = profile?.bio?.trim() || ARTIST_PROFILE.bio;

  return (
    <section className="artist-intro wrap" id="artist-intro" aria-labelledby="artist-intro-title" data-arrival="">
      <div className="artist-intro-inner">
        <h2 id="artist-intro-title">{name}</h2>
        <p className="artist-intro-role">{role}</p>
        <p className="artist-intro-bio">{bio}</p>
        <ContactChannels editableHomeLabel />
      </div>
    </section>
  );
}
