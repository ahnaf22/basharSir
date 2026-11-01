class CachedChapterMaterial {
  final int chapterId;
  final String subjectNameBn;
  final String chapterTitleBn;
  final String summaryNotesBn;
  final List<String> keyFormulas;
  final DateTime downloadedAt;

  const CachedChapterMaterial({
    required this.chapterId,
    required this.subjectNameBn,
    required this.chapterTitleBn,
    required this.summaryNotesBn,
    required this.keyFormulas,
    required this.downloadedAt,
  });
}

class QueuedExamAnswerDraft {
  final int attemptId;
  final int questionId;
  final String answerValue;
  final DateTime savedAt;
  final bool synced;

  const QueuedExamAnswerDraft({
    required this.attemptId,
    required this.questionId,
    required this.answerValue,
    required this.savedAt,
    this.synced = false,
  });

  QueuedExamAnswerDraft copyWith({bool? synced}) {
    return QueuedExamAnswerDraft(
      attemptId: attemptId,
      questionId: questionId,
      answerValue: answerValue,
      savedAt: savedAt,
      synced: synced ?? this.synced,
    );
  }
}

class OfflineCacheStore {
  final Map<int, CachedChapterMaterial> _materialsByChapter = {};
  final Map<String, QueuedExamAnswerDraft> _examDraftQueue = {};
  final Map<String, Map<String, dynamic>> _idempotentTutorTurns = {};

  void cacheChapterMaterial(CachedChapterMaterial material) {
    _materialsByChapter[material.chapterId] = material;
  }

  CachedChapterMaterial? getCachedChapter(int chapterId) {
    return _materialsByChapter[chapterId];
  }

  List<CachedChapterMaterial> getAllCachedChapters() {
    return _materialsByChapter.values.toList();
  }

  void saveOfflineExamAnswer({
    required int attemptId,
    required int questionId,
    required String answerValue,
  }) {
    final key = '$attemptId:$questionId';
    _examDraftQueue[key] = QueuedExamAnswerDraft(
      attemptId: attemptId,
      questionId: questionId,
      answerValue: answerValue,
      savedAt: DateTime.now(),
      synced: false,
    );
  }

  List<QueuedExamAnswerDraft> getPendingExamDrafts(int attemptId) {
    return _examDraftQueue.values
        .where((d) => d.attemptId == attemptId && !d.synced)
        .toList();
  }

  int markAllDraftsSynced(int attemptId) {
    var count = 0;
    for (final entry in _examDraftQueue.entries.toList()) {
      if (entry.value.attemptId == attemptId && !entry.value.synced) {
        _examDraftQueue[entry.key] = entry.value.copyWith(synced: true);
        count++;
      }
    }
    return count;
  }

  void recordTutorTurnSubmission(String clientTurnId, Map<String, dynamic> payload) {
    _idempotentTutorTurns[clientTurnId] = payload;
  }

  Map<String, dynamic>? getTutorTurnByClientId(String clientTurnId) {
    return _idempotentTutorTurns[clientTurnId];
  }
}
