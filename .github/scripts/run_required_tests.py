"""Run one mandatory unittest suite. Empty or skipped tests fail CI."""

import sys
import unittest


def main(directory):
    suite = unittest.TestLoader().discover(directory, pattern="test_*.py")
    result = unittest.TextTestRunner().run(suite)
    if result.skipped:
        for case, reason in result.skipped:
            print(f"Required test skipped: {case} ({reason})", file=sys.stderr)
        return 1
    if not result.testsRun:
        print(f"No required tests ran in {directory}.", file=sys.stderr)
        return 1
    return 0 if result.wasSuccessful() else 1


if __name__ == "__main__":
    if len(sys.argv) != 2:
        sys.exit("Usage: run_required_tests.py TEST_DIRECTORY")
    sys.exit(main(sys.argv[1]))
