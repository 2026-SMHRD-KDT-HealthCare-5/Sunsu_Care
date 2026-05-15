const analysisService = require('../services/analysisService');

exports.analyze = async (req, res) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        message: 'ingredient_image 파일이 필요합니다.',
      });
    }

    const result = await analysisService.analyzeIngredientImage(file);

    return res.json(result);
  } catch (error) {
    console.error('분석 오류:', error);

    return res.status(500).json({
      message: '분석 중 서버 오류가 발생했습니다.',
    });
  }
};

exports.getAnalysisHistory = async (req, res) => {
  try {
    const history = await analysisService.getAnalysisHistory();

    return res.json(history);
  } catch (error) {
    console.error('히스토리 조회 오류:', error);

    return res.status(500).json({
      message: '분석 히스토리 조회 중 서버 오류가 발생했습니다.',
    });
  }
};

exports.getAnalysisDetail = async (req, res) => {
  try {
    const { analysis_idx } = req.params;

    const detail = await analysisService.getAnalysisDetail(analysis_idx);

    if (!detail) {
      return res.status(404).json({
        message: '분석 결과를 찾을 수 없습니다.',
      });
    }

    return res.json(detail);
  } catch (error) {
    console.error('히스토리 상세 조회 오류:', error);

    return res.status(500).json({
      message: '분석 상세 조회 중 서버 오류가 발생했습니다.',
    });
  }
};

exports.getRecommendations = async (req, res) => {
  try {
    const { analysis_idx } = req.query;

    const recommendations = await analysisService.getRecommendations(analysis_idx);

    return res.json(recommendations);
  } catch (error) {
    console.error('추천 제품 조회 오류:', error);

    return res.status(500).json({
      message: '추천 제품 조회 중 서버 오류가 발생했습니다.',
    });
  }
};