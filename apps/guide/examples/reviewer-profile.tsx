import { useLayoutEffect, useRef, useState } from "react";
import { Button, Text } from "@openboa/yogurt";
import { ProfileCard } from "@openboa/yogurt/motion-patterns";
import { playSprings, spring } from "../../../packages/web/src/foundation/spring-motion.js";

export function ReviewerProfile() {
  const [following, setFollowing] = useState(false);
  const [message, setMessage] = useState(false);
  const [motion] = useState(() => ({
    follow: spring(0, 300, 22),
    pop: spring(1, 520, 14),
    ones: spring(9, 260, 22),
    tens: spring(8, 260, 22),
  }));
  const area = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const node = area.current;
    if (!node) return;
    motion.follow.target = following ? 1 : 0;
    motion.ones.target = following ? 10 : 9;
    if (following) motion.pop.velocity = 4;
    let stop = playSprings(Object.values(motion), paint);
    const carry = setTimeout(() => {
      motion.tens.target = following ? 9 : 8;
      stop();
      stop = playSprings(Object.values(motion), paint);
    }, matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 60);
    function paint() {
      const p = Math.max(0, Math.min(1, motion.follow.position));
      node?.style.setProperty("--profile-open", String(p));
      node?.style.setProperty("--profile-ones", String(motion.ones.position));
      node?.style.setProperty("--profile-tens", String(motion.tens.position));
      const avatar = node?.closest(".yg-profile-card")?.querySelector<HTMLElement>(".yg-profile-avatar");
      if (avatar) avatar.style.scale = String(motion.pop.position);
    }
    return () => {clearTimeout(carry); stop();};
  }, [following, motion]);
  const digits = (place: "tens" | "ones") =>
    <span className="motion-profile-reel" aria-hidden="true">
      <span style={{translate: `0 calc(var(--profile-${place}) * -1.2em)`}}>
        {Array.from({length: 11}, (_, digit) => <span key={digit}>{digit % 10}</span>)}
      </span>
    </span>;
  return <ProfileCard name="Kai" initials="K" detail="Workspace reviewer" actions={
    <div className="motion-profile-content" ref={area}>
      <Text>Reviews new drafts and flags decisions.</Text>
      <div className="motion-profile-count">
        <strong aria-label={following ? "12,490 followers" : "12,489 followers"}>
          <span aria-hidden="true">12,4</span>{digits("tens")}{digits("ones")}
        </strong> Followers
      </div>
      <div className="motion-profile-actions">
        <Button emphasis="quiet" type="button" aria-pressed={following} aria-label={following ? "Following Kai" : "Follow Kai"}
          onClick={() => {setFollowing(value => !value); setMessage(false);}}>
          <i className="motion-profile-layer" aria-hidden="true" />
          <span className="motion-profile-follow" aria-hidden="true">Follow</span><span className="motion-profile-following" aria-hidden="true">Following</span>
        </Button>
        <Button emphasis="quiet" type="button" inert={!following} aria-hidden={!following} onClick={() => setMessage(true)}>Message</Button>
      </div>
      {message && <Text role="status" variant="help">A message draft is ready for Kai.</Text>}
    </div>
  } />;
}
