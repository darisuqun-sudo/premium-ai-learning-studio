import { describe, expect, it } from 'vitest';
import { validateSkillMarkdown } from './skillValidator';

describe('validateSkillMarkdown', () => {
  it('accepts valid YAML front matter with required fields', () => {
    const result = validateSkillMarkdown(
      '---\nname: sample-skill\ndescription: A useful skill for teaching a sample workflow.\n---\n\n# Instructions\nDo the task.'
    );
    expect(result.valid).toBe(true);
    expect(result.name).toBe('sample-skill');
    expect(result.errors).toHaveLength(0);
  });

  it('reports missing front matter', () => {
    const result = validateSkillMarkdown('# No front matter');
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toContain('YAML Front Matter');
  });

  it('reports missing required fields or whitespace-only fields', () => {
    const result = validateSkillMarkdown('---\nname: sample-skill\ndescription: "   "\n---\n\n# Instructions');
    expect(result.valid).toBe(false);
    expect(result.errors.join(' ')).toContain('description');
  });

  it('reports malformed YAML', () => {
    const result = validateSkillMarkdown('---\nname: [broken\ndescription: nope\n---\n');
    expect(result.valid).toBe(false);
    expect(result.errors.join(' ')).toContain('YAML');
  });

  it('checks referenced files against ZIP package file list when provided', () => {
    const md =
      '---\nname: sample-skill\ndescription: A useful skill for teaching a sample workflow.\n---\n\nRead `references/guide.md` and `templates/form.md`.';
    const checkWithMissing = validateSkillMarkdown(md, ['sample-skill/SKILL.md', 'sample-skill/references/guide.md']);
    expect(checkWithMissing.valid).toBe(true);
    expect(checkWithMissing.referencedFiles).toEqual(['references/guide.md', 'templates/form.md']);
    expect(checkWithMissing.missingFiles).toEqual(['templates/form.md']);
    expect(checkWithMissing.warnings.join(' ')).toContain('templates/form.md');
  });
});
