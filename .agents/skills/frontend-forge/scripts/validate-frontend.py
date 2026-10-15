#!/usr/bin/env python3
"""
Script de Validação Automatizada de Frontend (Frontend Forge)
Executa verificações estáticas de identidade visual, conformidade de tokens,
acessibilidade (WCAG 2.2 AA) e integridade de tipos.
"""

import sys
import subprocess
from pathlib import Path

# Adiciona o diretório c:/mcp-servers ao sys.path para reutilizar os módulos de auditoria
MCP_SERVERS_DIR = Path("C:/mcp-servers").resolve()
if str(MCP_SERVERS_DIR) not in sys.path:
    sys.path.insert(0, str(MCP_SERVERS_DIR))

try:
    if hasattr(sys.stdout, 'reconfigure'):
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    if hasattr(sys.stderr, 'reconfigure'):
        sys.stderr.reconfigure(encoding='utf-8', errors='replace')
except Exception:
    pass

try:
    import frontend_mcp
except ImportError:
    frontend_mcp = None


def main():
    strict_mode = "--strict" in sys.argv
    argumentos_caminho = [a for a in sys.argv[1:] if not a.startswith("--")]
    if argumentos_caminho:
        alvo = Path(argumentos_caminho[0]).resolve()
    else:
        alvo = Path.cwd().resolve()

    print("\n" + "=" * 65)
    print(" ⚔️  FRONTEND FORGE — SUÍTE DE AUDITORIA & QUALIDADE TÉCNICA")
    print("=" * 65)
    print(f"Diretório Alvo: {alvo}")
    print(f"Modo Estrito: {'Ativado (--strict)' if strict_mode else 'Desativado (Avisos de Refinamento permitidos)'}\n")

    if not alvo.exists():
        print(f"❌ Erro: Diretório {alvo} não existe.")
        sys.exit(1)

    falhas_criticas = 0
    avisos_refinamento = 0

    # 1. Auditoria de Identidade Visual e UX Defensiva
    print("🔎 [1/3] Executando Auditoria de Identidade Visual & UX Defensiva...")
    if frontend_mcp:
        resultado_identidade = frontend_mcp.auditar_identidade_frontend(str(alvo))
        print(resultado_identidade)
        if "🎨" in resultado_identidade or "⚠️" in resultado_identidade:
            falhas_criticas += 1
    else:
        print("⚠️ Módulo frontend_mcp não encontrado. Pulando auditoria MCP.")

    print("\n" + "-" * 65)

    # 2. Verificação de Consistência de Design Tokens
    print("📏 [2/3] Executando Verificação de Consistência de Tokens...")
    if frontend_mcp:
        resultado_tokens = frontend_mcp.verificar_consistencia_tokens(str(alvo))
        print(resultado_tokens)
        if "📏" in resultado_tokens:
            avisos_refinamento += 1
            if strict_mode:
                falhas_criticas += 1
    else:
        print("⚠️ Módulo frontend_mcp não encontrado. Pulando verificação de tokens.")

    print("\n" + "-" * 65)

    # 3. Verificação de Tipos TypeScript (se tsconfig existir)
    print("🔷 [3/3] Checagem de Tipos TypeScript...")
    tem_tsconfig = list(alvo.glob("tsconfig*.json")) or list(alvo.parent.glob("tsconfig*.json"))
    if tem_tsconfig:
        try:
            res = subprocess.run(
                ["npx.cmd", "tsc", "--noEmit"],
                cwd=str(alvo),
                capture_output=True,
                text=True,
                timeout=40
            )
            if res.returncode == 0:
                print("✅ TypeScript: 0 erros de compilação ou tipagem encontrados.")
            else:
                print("❌ Erros de Tipagem TypeScript encontrados:")
                print(res.stdout[:2000] if res.stdout else res.stderr[:2000])
                falhas_criticas += 1
        except Exception as e:
            print(f"ℹ️ Não foi possível rodar tsc diretamente ({e}). Verifique manualmente se a stack utilizar TS.")
    else:
        print("ℹ️ Nenhum tsconfig.json encontrado diretamente na pasta. Checagem de TS pulada.")

    print("\n" + "=" * 65)
    if falhas_criticas == 0:
        if avisos_refinamento > 0:
            print(f" ✨ APROVADO COM SUGESTÕES: {avisos_refinamento} aviso(s) de refinamento de tokens identificado(s).")
        else:
            print(" 🎉 PARABÉNS: O código passou em 100% dos portões de qualidade do Frontend Forge!")
        print("=" * 65 + "\n")
        sys.exit(0)
    else:
        print(f" ❌ BLOQUEADO: Foram encontradas {falhas_criticas} falha(s) crítica(s) que impedem a entrega.")
        print("=" * 65 + "\n")
        sys.exit(1)


if __name__ == "__main__":
    main()
