#!/usr/bin/env python3
"""
Sincronizador CLI de Tokens do Figma (Tokens Studio / Style Dictionary)
Gera automaticamente CSS Variables e extensão de tema para Tailwind CSS.
Uso: python sync-figma-tokens.py <caminho_tokens.json> [--css src/tokens.css] [--tailwind tailwind.tokens.js]
"""
import sys
import json
import re
import argparse
from pathlib import Path

# Configura encoding no Windows PowerShell para evitar UnicodeEncodeError
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")


def extrair_tokens_recursivo(obj, prefixo="", tokens_planos=None):
    if tokens_planos is None:
        tokens_planos = {}

    if not isinstance(obj, dict):
        return tokens_planos

    if "value" in obj:
        val = obj["value"]
        tipo = obj.get("type", "")
        tokens_planos[prefixo] = {"value": val, "type": tipo}
        return tokens_planos

    for chave, sub in obj.items():
        if chave.startswith("$") and chave != "$value":
            continue
        novo_prefixo = f"{prefixo}.{chave}" if prefixo else chave
        if isinstance(sub, dict):
            extrair_tokens_recursivo(sub, novo_prefixo, tokens_planos)
        elif isinstance(sub, (str, int, float)):
            tokens_planos[novo_prefixo] = {"value": sub, "type": ""}

    return tokens_planos


def resolver_alias_tokens(tokens_planos: dict) -> dict:
    padrao_alias = re.compile(r'[\{\$]([a-zA-Z0-9_\-\.]+)[\}]?')
    resolvidos = {}

    for chave, info in tokens_planos.items():
        val = str(info["value"])
        tipo = info["type"]

        for _ in range(8):
            match = padrao_alias.search(val)
            if not match:
                break
            ref_chave = match.group(1)
            if ref_chave in tokens_planos:
                sub_val = str(tokens_planos[ref_chave]["value"])
                val = val.replace(match.group(0), sub_val)
            else:
                break

        resolvidos[chave] = {"value": val, "type": tipo}

    return resolvidos


def gerar_css_e_tailwind(tokens_resolvidos: dict):
    linhas_css_root = [
        "/* ==========================================================================",
        "   Design Tokens gerados automaticamente via Frontend Forge (Figma Sync)",
        "   Compatível com Style Dictionary, Tokens Studio, Tailwind v3 e Tailwind v4",
        "   ========================================================================== */",
        "",
        ":root {"
    ]

    linhas_css_dark = [
        "",
        "/* Dark Mode Overrides */",
        ".dark, [data-theme=\"dark\"] {"
    ]

    linhas_tailwind_v4 = [
        "",
        "/* Tailwind CSS v4 Theme Extension */",
        "@theme {"
    ]

    tailwind_extend = {
        "colors": {},
        "spacing": {},
        "borderRadius": {},
        "boxShadow": {},
        "fontSize": {},
        "fontFamily": {}
    }

    contadores = {
        "cores": 0,
        "espacamentos": 0,
        "raios": 0,
        "sombras": 0,
        "tipografias": 0,
        "dark_overrides": 0,
        "outros": 0
    }

    tem_dark_overrides = False

    for chave, info in sorted(tokens_resolvidos.items()):
        val = str(info["value"]).strip()
        tipo = info["type"].lower()
        partes = chave.split(".")

        is_dark_token = partes[0].lower() in ("dark", "night") or (len(partes) > 1 and partes[1].lower() == "dark")
        partes_limpas = [p for p in partes if p.lower() not in ("dark", "night", "light", "global")]
        nome_sufixo = "-".join(partes_limpas if partes_limpas else partes).replace(" ", "-").lower()
        nome_var_css = f"--{nome_sufixo}"

        if is_dark_token:
            tem_dark_overrides = True
            contadores["dark_overrides"] += 1
            linhas_css_dark.append(f"  {nome_var_css}: {val};")
            continue

        linhas_css_root.append(f"  {nome_var_css}: {val};")

        primeira_parte = partes_limpas[0].lower() if partes_limpas else partes[0].lower()

        if tipo in ("color", "colors") or "color" in primeira_parte:
            contadores["cores"] += 1
            d = tailwind_extend["colors"]
            sub_partes = partes_limpas[1:] if len(partes_limpas) > 1 else partes_limpas
            for p in sub_partes[:-1]:
                d = d.setdefault(p, {})
            d[sub_partes[-1]] = f"var({nome_var_css}, {val})"
            linhas_tailwind_v4.append(f"  --color-{nome_sufixo.replace('color-', '').replace('colors-', '')}: var({nome_var_css});")

        elif tipo in ("spacing", "space", "dimension") or "space" in primeira_parte or "spacing" in primeira_parte:
            contadores["espacamentos"] += 1
            nome_chave = "-".join(partes_limpas[1:]) if len(partes_limpas) > 1 else partes_limpas[0]
            tailwind_extend["spacing"][nome_chave] = f"var({nome_var_css}, {val})"
            linhas_tailwind_v4.append(f"  --spacing-{nome_chave}: var({nome_var_css});")

        elif tipo in ("borderradius", "radius") or "radius" in primeira_parte:
            contadores["raios"] += 1
            nome_chave = "-".join(partes_limpas[1:]) if len(partes_limpas) > 1 else partes_limpas[0]
            tailwind_extend["borderRadius"][nome_chave] = f"var({nome_var_css}, {val})"
            linhas_tailwind_v4.append(f"  --radius-{nome_chave}: var({nome_var_css});")

        elif tipo in ("boxshadow", "shadow") or "shadow" in primeira_parte:
            contadores["sombras"] += 1
            nome_chave = "-".join(partes_limpas[1:]) if len(partes_limpas) > 1 else partes_limpas[0]
            tailwind_extend["boxShadow"][nome_chave] = f"var({nome_var_css}, {val})"

        elif tipo in ("fontfamilies", "fontfamily", "fontsize", "typography") or "font" in primeira_parte:
            contadores["tipografias"] += 1
            nome_chave = "-".join(partes_limpas[1:]) if len(partes_limpas) > 1 else partes_limpas[0]
            tailwind_extend["fontSize"][nome_chave] = f"var({nome_var_css}, {val})"

        else:
            contadores["outros"] += 1

    linhas_css_root.append("}\n")
    linhas_css_dark.append("}\n")
    linhas_tailwind_v4.append("}\n")

    codigo_css = "\n".join(linhas_css_root)
    if tem_dark_overrides:
        codigo_css += "\n" + "\n".join(linhas_css_dark)
    codigo_css += "\n" + "\n".join(linhas_tailwind_v4)

    tailwind_extend_limpo = {k: v for k, v in tailwind_extend.items() if v}

    codigo_tailwind = (
        "// Generated by Frontend Forge (Figma Tokens Sync - Tailwind v3)\n"
        "// Para Tailwind v3: adicione em tailwind.config.js -> module.exports = { theme: { extend: tokens } }\n"
        "// Para Tailwind v4: os tokens já estão definidos automaticamente no bloco @theme do seu arquivo CSS!\n"
        "module.exports = " + json.dumps(tailwind_extend_limpo, indent=2, ensure_ascii=False) + ";\n"
    )

    return codigo_css, codigo_tailwind, contadores


def main():
    parser = argparse.ArgumentParser(description="Sincronizador CLI de Tokens Figma")
    parser.add_argument("tokens_json", help="Caminho para o arquivo tokens.json exportado do Figma")
    parser.add_argument("--css", default="src/tokens.css", help="Destino do arquivo CSS de variáveis (default: src/tokens.css)")
    parser.add_argument("--tailwind", default="tailwind.tokens.js", help="Destino do arquivo de tokens Tailwind (default: tailwind.tokens.js)")

    args = parser.parse_args()

    caminho_json = Path(args.tokens_json).resolve()
    if not caminho_json.exists():
        print(f"Erro: Arquivo '{caminho_json}' não encontrado.", file=sys.stderr)
        sys.exit(1)

    try:
        dados = json.loads(caminho_json.read_text(encoding="utf-8"))
    except Exception as e:
        print(f"Erro ao ler JSON: {e}", file=sys.stderr)
        sys.exit(1)

    tokens_planos = extrair_tokens_recursivo(dados)
    tokens_resolvidos = resolver_alias_tokens(tokens_planos)
    css, tw, stats = gerar_css_e_tailwind(tokens_resolvidos)

    arq_css = Path(args.css).resolve()
    arq_css.parent.mkdir(parents=True, exist_ok=True)
    arq_css.write_text(css, encoding="utf-8")

    arq_tw = Path(args.tailwind).resolve()
    arq_tw.parent.mkdir(parents=True, exist_ok=True)
    arq_tw.write_text(tw, encoding="utf-8")

    print("======================================================")
    print("🎨 TOKENS FIGMA SINCRONIZADOS COM SUCESSO!")
    print(f"Total de Tokens: {len(tokens_resolvidos)}")
    print(f"  • Cores: {stats['cores']}")
    print(f"  • Espaçamentos: {stats['espacamentos']}")
    print(f"  • Raios de Borda: {stats['raios']}")
    print(f"  • Sombras: {stats['sombras']}")
    print(f"  • Tipografia: {stats['tipografias']}")
    print("------------------------------------------------------")
    print(f"CSS Output: {arq_css}")
    print(f"Tailwind Output: {arq_tw}")
    print("======================================================")


if __name__ == "__main__":
    main()
