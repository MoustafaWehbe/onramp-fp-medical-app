import { ScrollTrigger } from "gsap/ScrollTrigger";

export function refreshScrollTriggerOnImageLoad(root: ParentNode) {
  const refresh = () => ScrollTrigger.refresh();
  const images = Array.from(root.querySelectorAll("img"));
  images.forEach((image) => image.addEventListener("load", refresh));
  return () => images.forEach((image) => image.removeEventListener("load", refresh));
}
