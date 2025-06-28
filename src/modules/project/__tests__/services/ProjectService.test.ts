import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import ProjectService from '../../application/services/ProjectService';

describe('ProjectService', () => {
  let projectService: ProjectService;

  beforeEach(() => {
    projectService = new ProjectService();
  });

  it('should be defined', () => {
    expect(projectService).toBeDefined();
  });
}); 