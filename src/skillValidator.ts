import yaml from 'js-yaml';

export type SkillCheck = {
  valid: boolean;
  name?: string;
  description?: string;
  referencedFiles?: string[];
  missingFiles?: string[];
  errors: string[];
  warnings: string[];
};

export function extractReferencedPaths(markdownBody: string): string[] {
  const refs = new Set<string>();
  const regex = /(?:`|\b)((?:references|templates|scripts|assets|examples|resources)\/[A-Za-z0-9._/-]+\.[A-Za-z0-9]+)(?:`|\b)/g;
  let m: RegExpExecArray | null;
  while ((m = regex.exec(markdownBody)) !== null) {
    refs.add(m[1]);
  }
  return Array.from(refs);
}

export function validateSkillMarkdown(content: string, packageFiles?: string[]): SkillCheck {
  const errors: string[] = [];
  const warnings: string[] = [];
  const match = content.match(/^---\s*\r?\n([\s\S]*?)\r?\n---\s*(?:\r?\n|$)/);
  if (!match) {
    return {
      valid: false,
      errors: ['SKILL.md نىڭ بېشىدا --- بىلەن ئايرىلغان YAML Front Matter تېپىلمىدى.'],
      warnings,
    };
  }

  let meta: unknown;
  try {
    meta = yaml.load(match[1]);
  } catch (e) {
    return {
      valid: false,
      errors: [`YAML خاتالىقى: ${e instanceof Error ? e.message : 'نامەلۇم خاتالىق'}`],
      warnings,
    };
  }

  if (!meta || typeof meta !== 'object' || Array.isArray(meta)) {
    errors.push('YAML مەزمۇنى object بولۇشى كېرەك.');
  }

  const data = meta && typeof meta === 'object' && !Array.isArray(meta) ? (meta as Record<string, unknown>) : {};
  const rawName = typeof data.name === 'string' ? data.name.trim() : undefined;
  const rawDescription = typeof data.description === 'string' ? data.description.trim() : undefined;
  const name = rawName || undefined;
  const description = rawDescription || undefined;

  if (!name) {
    errors.push('زۆرۈر مەيدان كەم: name.');
  } else if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(name)) {
    warnings.push('name ئادەتتە كىچىك ئىنگلىزچە ھەرپ، سان ۋە يەككە سىزىقچە (-) ئارقىلىق يېزىلىدۇ (kebab-case).');
  }

  if (!description) {
    errors.push('زۆرۈر مەيدان كەم: description.');
  } else if (description.length < 20) {
    warnings.push('description قىسقا بولۇشى مۇمكىن؛ قانداق ۋە قاچان ئىشلىتىلىدىغانلىقىنى ئېنىقلاڭ.');
  }

  const body = content.slice(match[0].length).trim();
  if (!body) {
    warnings.push('Front Matter دىن كېيىنكى Markdown كۆرسەتمىسى بوش.');
  }

  const referencedFiles = extractReferencedPaths(body);
  const missingFiles: string[] = [];

  if (packageFiles && packageFiles.length > 0 && referencedFiles.length > 0) {
    const normalizedPkg = packageFiles.map((f) => f.replace(/\\/g, '/').replace(/^\/+/, ''));
    for (const ref of referencedFiles) {
      const found = normalizedPkg.some((pkgPath) => pkgPath === ref || pkgPath.endsWith(`/${ref}`));
      if (!found) {
        missingFiles.push(ref);
      }
    }
    if (missingFiles.length > 0) {
      warnings.push(`SKILL.md ئىچىدە تىلغا ئېلىنغان بەزى ھۆججەتلەر بوغچىدا تېپىلمىدى: ${missingFiles.join(', ')}`);
    }
  }

  return {
    valid: errors.length === 0,
    name,
    description,
    referencedFiles,
    missingFiles,
    errors,
    warnings,
  };
}
