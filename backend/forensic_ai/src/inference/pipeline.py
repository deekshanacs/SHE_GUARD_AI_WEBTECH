"""
Stub for the full deep-learning ForensicEngine.
The classical pipeline in forensics.py is used unless trained
model checkpoints are present in outputs/checkpoints/.
"""
class ForensicEngine:
    def __init__(self, checkpoint_dir: str = ""):
        self.checkpoint_dir = checkpoint_dir
    def warmup(self):
        pass
    def analyze_image(self, image):
        raise RuntimeError("No trained checkpoints found — falling back to classical pipeline.")
