import subprocess
import sys
import tempfile
import textwrap
import unittest
from pathlib import Path


RUNNER = Path(__file__).with_name("run_required_tests.py")


class RequiredTestsTest(unittest.TestCase):
    def run_suite(self, body):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory, "test_sample.py")
            path.write_text("import unittest\n" + textwrap.dedent(body), encoding="utf-8")
            return subprocess.run([sys.executable, "-I", str(RUNNER), directory],
                                  capture_output=True, text=True, check=False)

    def test_passing_tests(self):
        result = self.run_suite("""
            class Sample(unittest.TestCase):
                def test_passes(self):
                    self.assertEqual(2 + 2, 4)
        """)
        self.assertEqual(result.returncode, 0, result.stderr)

    def test_empty_failure_and_import_error(self):
        failure = """
            class Sample(unittest.TestCase):
                def test_failure(self):
                    self.fail("regression")
        """
        for source, message in [("", "No required tests ran"), (failure, "regression"),
                                ("raise ImportError('broken suite')", "broken suite")]:
            with self.subTest(message=message):
                result = self.run_suite(source)
                self.assertNotEqual(result.returncode, 0)
                self.assertIn(message, result.stderr)

    def test_skipped_method_class_and_subtest_alongside_a_pass(self):
        passing = "class Passing(unittest.TestCase):\n    def test_ok(self): pass\n"
        cases = [
            """
            class Sample(unittest.TestCase):
                @unittest.skip("skipped method")
                def test_required(self): pass
            """,
            """
            @unittest.skip("skipped class")
            class Sample(unittest.TestCase):
                def test_required(self): pass
            """,
            """
            class Sample(unittest.TestCase):
                def test_required(self):
                    with self.subTest(item=1):
                        self.skipTest("skipped subtest")
            """,
        ]
        for source in cases:
            with self.subTest(source=source):
                result = self.run_suite(passing + textwrap.dedent(source))
                self.assertNotEqual(result.returncode, 0)
                self.assertIn("Required test skipped:", result.stderr)
