from agents.performance import PerformanceAgent
from agents.security import SecurityAgent
from agents.style import StyleAgent
from agents.syntax_bug import SyntaxBugAgent

AGENT_MAP = {
    "syntax": SyntaxBugAgent,
    "security": SecurityAgent,
    "performance": PerformanceAgent,
    "style": StyleAgent,
}

__all__ = ["AGENT_MAP"]
