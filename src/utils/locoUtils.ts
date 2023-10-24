const supportedConstructions = ["303e", "203e"];

export function locoSupportsColdStart(constructionType: string) {
  return new RegExp(`(${supportedConstructions.join("|")})`).test(
    constructionType,
  );
}
