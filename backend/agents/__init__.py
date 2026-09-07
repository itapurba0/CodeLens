from agents.syntax_bug import SyntaxBugAgent
from agents.security import SecurityAgent
from agents.performance import PerformanceAgent
from agents.style import StyleAgent

AGENT_MAP = {
    "syntax": SyntaxBugAgent,
    "security": SecurityAgent,
    "performance": PerformanceAgent,
    "style": StyleAgent,
}

__all__ = ["AGENT_MAP"]
